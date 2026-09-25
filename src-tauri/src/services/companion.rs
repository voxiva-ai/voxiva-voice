//! Local companion HTTP server for phone remote type / dictate.

use std::net::{SocketAddr, TcpListener};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Mutex, OnceLock};
use std::thread;
use std::time::{Duration, Instant};

use qrcode::render::svg;
use qrcode::QrCode;
use serde::Serialize;
use tauri::AppHandle;
use tiny_http::{Header, Method, Request, Response, Server, StatusCode};

use crate::config::AppSettings;
use crate::services::{dictionary, focus, humanize, injection};
use crate::settings_store;

const PORT: u16 = 17890;
static RUNNING: AtomicBool = AtomicBool::new(false);
static TOKEN: OnceLock<Mutex<String>> = OnceLock::new();

fn token_lock() -> &'static Mutex<String> {
    TOKEN.get_or_init(|| Mutex::new(String::new()))
}

fn new_token() -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut h = DefaultHasher::new();
    Instant::now().hash(&mut h);
    std::process::id().hash(&mut h);
    format!("{:x}", h.finish())
}

fn load_persisted_token(app: &AppHandle) -> Option<String> {
    let path = crate::paths::companion_token_file(app).ok()?;
    let raw = std::fs::read_to_string(path).ok()?;
    let t = raw.trim().to_string();
    if t.is_empty() {
        None
    } else {
        Some(t)
    }
}

fn persist_token(app: &AppHandle, token: &str) {
    if let Ok(path) = crate::paths::companion_token_file(app) {
        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        let _ = std::fs::write(path, token);
    }
}

fn current_token() -> String {
    token_lock().lock().map(|g| g.clone()).unwrap_or_default()
}

fn check_token(req: &Request) -> bool {
    let expect = current_token();
    if expect.is_empty() {
        return false;
    }
    req.headers()
        .iter()
        .find(|h| h.field.equiv("X-Voxiva-Token"))
        .map(|h| h.value.as_str() == expect)
        .unwrap_or(false)
        || token_from_query(req.url()) == expect
}

fn token_from_query(url: &str) -> String {
    url.split('?')
        .nth(1)
        .unwrap_or("")
        .split('&')
        .find_map(|pair| {
            let mut it = pair.splitn(2, '=');
            match (it.next(), it.next()) {
                (Some("t"), Some(v)) => Some(v.to_string()),
                _ => None,
            }
        })
        .unwrap_or_default()
}

fn local_ip() -> Option<String> {
    let socket = std::net::UdpSocket::bind("0.0.0.0:0").ok()?;
    socket.connect("8.8.8.8:80").ok()?;
    Some(socket.local_addr().ok()?.ip().to_string())
}

fn respond_bytes(
    request: Request,
    bytes: &[u8],
    content_type: &str,
    cache: &str,
) -> Result<(), String> {
    let mut res = Response::from_data(bytes.to_vec()).with_status_code(StatusCode(200));
    if let Ok(h) = Header::from_bytes(b"Content-Type", content_type.as_bytes()) {
        res.add_header(h);
    }
    if let Ok(h) = Header::from_bytes(b"Cache-Control", cache.as_bytes()) {
        res.add_header(h);
    }
    // Help scanners / browsers treat this as an app shell, not a random LAN page.
    if let Ok(h) = Header::from_bytes(b"X-Content-Type-Options", b"nosniff") {
        res.add_header(h);
    }
    request.respond(res).map_err(|e| e.to_string())
}

fn respond_str(
    request: Request,
    body: &str,
    content_type: &str,
    cache: &str,
) -> Result<(), String> {
    respond_bytes(request, body.as_bytes(), content_type, cache)
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PhonePairInfo {
    pub url: String,
    pub token: String,
    pub qr_svg: String,
    pub running: bool,
}

pub fn pair_info() -> PhonePairInfo {
    let token = current_token();
    let host = local_ip().unwrap_or_else(|| "127.0.0.1".into());
    let url = if token.is_empty() {
        format!("http://{host}:{PORT}/")
    } else {
        format!("http://{host}:{PORT}/?t={token}")
    };
    let qr_svg = QrCode::new(url.as_bytes())
        .map(|code| {
            code.render::<svg::Color>()
                .min_dimensions(220, 220)
                .dark_color(svg::Color("#eef4ff"))
                .light_color(svg::Color("#06080d"))
                .build()
        })
        .unwrap_or_else(|_| String::from("<svg xmlns='http://www.w3.org/2000/svg'/>"));
    PhonePairInfo {
        url,
        token,
        qr_svg,
        running: RUNNING.load(Ordering::SeqCst),
    }
}

pub fn ensure_running(app: AppHandle) -> Result<PhonePairInfo, String> {
    {
        let mut t = token_lock().lock().map_err(|e| e.to_string())?;
        if t.is_empty() {
            *t = load_persisted_token(&app).unwrap_or_else(new_token);
            persist_token(&app, &t);
        }
    }
    if !RUNNING.load(Ordering::SeqCst) {
        start_server(app)?;
    }
    Ok(pair_info())
}

fn start_server(app: AppHandle) -> Result<(), String> {
    let addr = SocketAddr::from(([0, 0, 0, 0], PORT));
    let listener = TcpListener::bind(addr).map_err(|e| format!("Cannot bind port {PORT}: {e}"))?;
    let server = Server::from_listener(listener, None).map_err(|e| e.to_string())?;
    RUNNING.store(true, Ordering::SeqCst);

    thread::spawn(move || {
        tracing::info!("phone companion on 0.0.0.0:{PORT}");
        for request in server.incoming_requests() {
            if let Err(e) = handle(request, &app) {
                tracing::warn!("companion: {e}");
            }
        }
        RUNNING.store(false, Ordering::SeqCst);
    });
    thread::sleep(Duration::from_millis(50));
    Ok(())
}

fn handle(mut request: Request, app: &AppHandle) -> Result<(), String> {
    let method = request.method().clone();
    let url = request.url().to_string();
    let path = url.split('?').next().unwrap_or("/");

    if method == Method::Get && (path == "/" || path == "/index.html") {
        return respond_str(
            request,
            include_str!("../../companion/index.html"),
            "text/html; charset=utf-8",
            "no-cache",
        );
    }

    if method == Method::Get && path == "/manifest.webmanifest" {
        return respond_str(
            request,
            include_str!("../../companion/manifest.webmanifest"),
            "application/manifest+json; charset=utf-8",
            "no-cache",
        );
    }

    if method == Method::Get && path == "/sw.js" {
        return respond_str(
            request,
            include_str!("../../companion/sw.js"),
            "application/javascript; charset=utf-8",
            "no-cache",
        );
    }

    if method == Method::Get && (path == "/logo.png" || path == "/apple-touch-icon.png") {
        return respond_bytes(
            request,
            include_bytes!("../../icons/icon.png"),
            "image/png",
            "public, max-age=86400",
        );
    }

    if method == Method::Get && path == "/api/ping" {
        // Health only — proves the PC companion is up. Auth is required for /api/type.
        return respond_str(
            request,
            "{\"ok\":true,\"app\":\"voxiva-voice\"}",
            "application/json",
            "no-store",
        );
    }

    if method == Method::Post && path == "/api/type" {
        if !check_token(&request) {
            request
                .respond(Response::from_string("unauthorized").with_status_code(401))
                .map_err(|e| e.to_string())?;
            return Ok(());
        }
        let mut body = String::new();
        request
            .as_reader()
            .read_to_string(&mut body)
            .map_err(|e| e.to_string())?;
        let v: serde_json::Value = serde_json::from_str(&body).unwrap_or_default();
        let text = v.get("text").and_then(|x| x.as_str()).unwrap_or("").trim();
        if !text.is_empty() {
            paste_now(app, text);
        }
        return respond_str(request, "{\"ok\":true}", "application/json", "no-store");
    }

    request
        .respond(Response::from_string("not found").with_status_code(404))
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn paste_now(app: &AppHandle, text: &str) {
    let settings = settings_store::load(app).unwrap_or_else(|_| AppSettings::default());
    let mut out = dictionary::apply(text, &settings.dict_replacements);
    if settings.humanize_text {
        out = humanize::humanize(&out);
    }
    let target = focus::paste_target_for_session();
    if let Err(e) = injection::paste_text_with_method(&out, settings.paste_method, target.as_ref())
    {
        tracing::warn!("companion paste: {e}");
    }
}
