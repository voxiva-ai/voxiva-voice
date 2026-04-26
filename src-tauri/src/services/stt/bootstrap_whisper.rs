use std::fs;
use std::io::{Cursor, Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use tauri::path::BaseDirectory;
use tauri::AppHandle;
use tauri::Manager;

use crate::error::Result;
use crate::{paths, settings_store};

const WHISPER_BIN_URL: &str =
    "https://github.com/ggml-org/whisper.cpp/releases/download/v1.8.3/whisper-bin-x64.zip";
// base-q5_1 is fast but can be noticeably less accurate, especially for RU and short phrases.
// small-q5_1 is still reasonable in size, but much more reliable for everyday dictation.
const WHISPER_MODEL_URL: &str =
    "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small-q5_1.bin";
const VC_REDIST_X64_URL: &str = "https://aka.ms/vs/17/release/vc_redist.x64.exe";

fn whisper_paths(app: &AppHandle) -> Result<(PathBuf, PathBuf, PathBuf)> {
    let dir = paths::whisper_dir(app)?;
    let exe = dir.join("Release").join("whisper-cli.exe");
    let model = dir.join("ggml-small-q5_1.bin");
    Ok((dir, exe, model))
}

fn bundled_whisper_paths(app: &AppHandle) -> std::result::Result<(PathBuf, PathBuf), String> {
    let exe = app
        .path()
        .resolve("whisper/Release/whisper-cli.exe", BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;
    let model = app
        .path()
        .resolve("whisper/ggml-small-q5_1.bin", BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;
    Ok((exe, model))
}

fn copy_bundled_whisper_to_config_dir(
    app: &AppHandle,
    dir: &Path,
) -> std::result::Result<(PathBuf, PathBuf), String> {
    let (bundled_exe, bundled_model) = bundled_whisper_paths(app)?;
    if !bundled_exe.exists() || !bundled_model.exists() {
        return Err("bundled whisper resources not found".to_string());
    }

    // Copy the whole bundled Release/ folder (DLLs + exe)
    let bundled_release_dir = bundled_exe
        .parent()
        .ok_or_else(|| "bundled whisper-cli has no parent dir".to_string())?;
    let out_release_dir = dir.join("Release");
    if out_release_dir.exists() {
        let _ = fs::remove_dir_all(&out_release_dir);
    }
    fs::create_dir_all(&out_release_dir).map_err(|e| e.to_string())?;
    for entry in fs::read_dir(bundled_release_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if path.is_file() {
            let file_name = path
                .file_name()
                .ok_or_else(|| "invalid bundled file name".to_string())?;
            fs::copy(&path, out_release_dir.join(file_name)).map_err(|e| e.to_string())?;
        }
    }

    let out_model = dir.join("ggml-small-q5_1.bin");
    fs::copy(bundled_model, &out_model).map_err(|e| e.to_string())?;

    let out_exe = out_release_dir.join("whisper-cli.exe");
    if !out_exe.exists() {
        return Err("copied Release/whisper-cli.exe not found".to_string());
    }
    Ok((out_exe, out_model))
}

fn download_to(url: &str, path: &Path) -> std::result::Result<(), String> {
    let mut resp = reqwest::blocking::get(url).map_err(|e| e.to_string())?;
    if !resp.status().is_success() {
        return Err(format!("download failed: {url} ({})", resp.status()));
    }
    let mut buf = Vec::new();
    resp.copy_to(&mut buf).map_err(|e| e.to_string())?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let mut f = fs::File::create(path).map_err(|e| e.to_string())?;
    f.write_all(&buf).map_err(|e| e.to_string())?;
    Ok(())
}

fn extract_whisper_release_from_zip(
    zip_path: &Path,
    out_dir: &Path,
) -> std::result::Result<(), String> {
    let bytes = fs::read(zip_path).map_err(|e| e.to_string())?;
    let reader = Cursor::new(bytes);
    let mut archive = zip::ZipArchive::new(reader).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let mut f = archive.by_index(i).map_err(|e| e.to_string())?;
        let name = f.name().replace('\\', "/");
        if name.ends_with('/') {
            continue;
        }

        // Keep only Release/* to minimize size and keep required DLLs next to the exe.
        // Also accept nested root folder like whisper-bin-x64/Release/*
        let release_idx = name.find("Release/");
        let Some(idx) = release_idx else { continue };
        let rel = &name[idx..];
        let out_path = out_dir.join(rel);
        if let Some(parent) = out_path.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let mut buf = Vec::new();
        f.read_to_end(&mut buf).map_err(|e| e.to_string())?;
        fs::write(out_path, buf).map_err(|e| e.to_string())?;
    }
    // sanity: ensure the exe exists
    let exe = out_dir.join("Release").join("whisper-cli.exe");
    if !exe.exists() {
        return Err("Release/whisper-cli.exe not found after extraction".to_string());
    }
    Ok(())
}

#[cfg(windows)]
fn probe_whisper_cli(exe: &Path) -> std::result::Result<(), String> {
    let out = Command::new(exe)
        .arg("-h")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map_err(|e| e.to_string())?;

    if out.success() {
        Ok(())
    } else {
        Err(format!("whisper-cli exited with {out}"))
    }
}

#[cfg(not(windows))]
fn probe_whisper_cli(_exe: &Path) -> std::result::Result<(), String> {
    Ok(())
}

#[cfg(windows)]
fn install_vc_redist_x64(dir: &Path) -> std::result::Result<(), String> {
    let installer = dir.join("vc_redist.x64.exe");
    download_to(VC_REDIST_X64_URL, &installer)?;

    let status = Command::new(&installer)
        .args(["/install", "/quiet", "/norestart"])
        .status()
        .map_err(|e| e.to_string())?;

    let _ = fs::remove_file(&installer);

    // 0 = success, 3010 = success but reboot required (MSI code, may surface as 0xBC2)
    if status.success() {
        Ok(())
    } else {
        Err(format!("vc_redist install failed: {status}"))
    }
}

/// Ensures whisper-cli + model exist under the app config dir.
/// Updates settings to point to them and switches STT mode to Whisper if appropriate.
pub fn ensure_whisper_assets(app: &AppHandle) -> Result<()> {
    let (dir, exe, model) = whisper_paths(app)?;

    let release_dir = dir.join("Release");

    // Prefer bundled assets (no downloads) when available.
    if !exe.exists() || !model.exists() {
        if let Ok((out_exe, out_model)) = copy_bundled_whisper_to_config_dir(app, &dir) {
            tracing::info!("using bundled whisper assets");
            // Persist settings pointers so the UI doesn't require manual paths.
            let mut s = settings_store::load(app)?;
            s.whisper_cli_path = Some(out_exe.to_string_lossy().to_string());
            s.whisper_model_path = Some(out_model.to_string_lossy().to_string());
            s.stt_mode = crate::config::SttMode::WhisperCli;
            settings_store::save(app, &s)?;
            return Ok(());
        }
    }

    // (re)install whisper-cli + required DLLs if missing.
    if !exe.exists() {
        fs::create_dir_all(&dir)?;
        let zip_path = dir.join("whisper-bin-x64.zip");
        tracing::info!("downloading whisper-cli bundle...");
        download_to(WHISPER_BIN_URL, &zip_path).map_err(crate::error::AppError::Config)?;
        extract_whisper_release_from_zip(&zip_path, &dir)
            .map_err(crate::error::AppError::Config)?;
        let _ = fs::remove_file(&zip_path);
    }

    if !model.exists() {
        tracing::info!("downloading whisper model (small-q5_1)...");
        download_to(WHISPER_MODEL_URL, &model).map_err(crate::error::AppError::Config)?;
    }

    // If whisper-cli fails to start with missing runtime, install VC++ redist and retry.
    #[cfg(windows)]
    {
        if let Err(e) = probe_whisper_cli(&exe) {
            tracing::warn!("whisper-cli probe failed: {e}");
            tracing::info!("attempting to install VC++ runtime (x64)...");
            install_vc_redist_x64(&dir).map_err(crate::error::AppError::Config)?;
            // ensure everything is in place after install
            if let Err(e2) = probe_whisper_cli(&exe) {
                // one more attempt: re-extract release in case of partial files
                tracing::warn!("whisper-cli probe still failing after VC++ runtime: {e2}");
                // try a fresh extraction
                let zip_path = dir.join("whisper-bin-x64.zip");
                download_to(WHISPER_BIN_URL, &zip_path).map_err(crate::error::AppError::Config)?;
                if release_dir.exists() {
                    let _ = fs::remove_dir_all(&release_dir);
                }
                extract_whisper_release_from_zip(&zip_path, &dir)
                    .map_err(crate::error::AppError::Config)?;
                let _ = fs::remove_file(&zip_path);
                probe_whisper_cli(&exe).map_err(crate::error::AppError::Config)?;
            }
        }
    }

    // Persist settings pointers so the UI doesn't require manual paths.
    let mut s = settings_store::load(app)?;
    if s.whisper_cli_path.as_deref() != Some(exe.to_string_lossy().as_ref()) {
        s.whisper_cli_path = Some(exe.to_string_lossy().to_string());
    }
    if s.whisper_model_path.as_deref() != Some(model.to_string_lossy().as_ref()) {
        s.whisper_model_path = Some(model.to_string_lossy().to_string());
    }
    // Default user-facing behavior: prefer WhisperCli once assets are present.
    s.stt_mode = crate::config::SttMode::WhisperCli;
    settings_store::save(app, &s)?;

    Ok(())
}
