//! Microphone capture via cpal (default input device).

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::SampleFormat;

#[derive(Debug, Clone)]
pub struct CapturedAudio {
    pub samples: Vec<f32>,
    pub sample_rate_hz: u32,
}

fn build_stream_with_level_cb<F>(
    device: &cpal::Device,
    cfg: &cpal::StreamConfig,
    sample_format: SampleFormat,
    channels: usize,
    stop: Arc<AtomicBool>,
    samples: Arc<Mutex<Vec<f32>>>,
    mut on_level: Option<F>,
) -> Result<cpal::Stream, cpal::BuildStreamError>
where
    F: FnMut(f32, usize) + Send + 'static,
{
    let err_fn = |e| tracing::warn!("cpal stream error: {e}");

    match sample_format {
        SampleFormat::F32 => device.build_input_stream(
            cfg,
            move |data: &[f32], _| {
                if stop.load(Ordering::Relaxed) {
                    return;
                }
                if let Some(cb) = on_level.as_mut() {
                    let mut sum = 0.0f32;
                    let mut n = 0usize;
                    for frame in data.chunks(channels) {
                        let m = if channels == 1 {
                            frame[0]
                        } else {
                            frame.iter().copied().sum::<f32>() / channels.max(1) as f32
                        };
                        sum += m * m;
                        n += 1;
                    }
                    if n > 0 {
                        cb((sum / n as f32).sqrt(), n);
                    }
                }
                if channels == 1 {
                    samples.lock().unwrap().extend_from_slice(data);
                } else {
                    let mut lock = samples.lock().unwrap();
                    for frame in data.chunks(channels) {
                        let m = frame.iter().copied().sum::<f32>() / channels.max(1) as f32;
                        lock.push(m);
                    }
                }
            },
            err_fn,
            None,
        ),
        SampleFormat::I16 => device.build_input_stream(
            cfg,
            move |data: &[i16], _| {
                if stop.load(Ordering::Relaxed) {
                    return;
                }
                if let Some(cb) = on_level.as_mut() {
                    let mut sum = 0.0f32;
                    let mut n = 0usize;
                    for frame in data.chunks(channels) {
                        let m = if channels == 1 {
                            frame[0] as f32 / 32768.0
                        } else {
                            frame.iter().map(|s| *s as f32 / 32768.0).sum::<f32>()
                                / channels.max(1) as f32
                        };
                        sum += m * m;
                        n += 1;
                    }
                    if n > 0 {
                        cb((sum / n as f32).sqrt(), n);
                    }
                }
                let mut lock = samples.lock().unwrap();
                if channels == 1 {
                    lock.extend(data.iter().map(|s| *s as f32 / 32768.0));
                } else {
                    for frame in data.chunks(channels) {
                        let m = frame.iter().map(|s| *s as f32 / 32768.0).sum::<f32>()
                            / channels.max(1) as f32;
                        lock.push(m);
                    }
                }
            },
            err_fn,
            None,
        ),
        SampleFormat::U16 => device.build_input_stream(
            cfg,
            move |data: &[u16], _| {
                if stop.load(Ordering::Relaxed) {
                    return;
                }
                if let Some(cb) = on_level.as_mut() {
                    let mut sum = 0.0f32;
                    let mut n = 0usize;
                    for frame in data.chunks(channels) {
                        let m = if channels == 1 {
                            (frame[0] as f32 - 32768.0) / 32768.0
                        } else {
                            frame
                                .iter()
                                .map(|s| (*s as f32 - 32768.0) / 32768.0)
                                .sum::<f32>()
                                / channels.max(1) as f32
                        };
                        sum += m * m;
                        n += 1;
                    }
                    if n > 0 {
                        cb((sum / n as f32).sqrt(), n);
                    }
                }
                let mut lock = samples.lock().unwrap();
                if channels == 1 {
                    lock.extend(
                        data.iter()
                            .map(|s| (*s as f32 - 32768.0) / 32768.0),
                    );
                } else {
                    for frame in data.chunks(channels) {
                        let m = frame
                            .iter()
                            .map(|s| (*s as f32 - 32768.0) / 32768.0)
                            .sum::<f32>()
                            / channels.max(1) as f32;
                        lock.push(m);
                    }
                }
            },
            err_fn,
            None,
        ),
        _ => Err(cpal::BuildStreamError::StreamConfigNotSupported),
    }
}

/// Records mono `f32` samples until `stop` is set to `true`, then stops the stream.
pub fn record_while_stopped<F>(
    stop: &Arc<AtomicBool>,
    mut on_level: Option<F>,
) -> Result<CapturedAudio, String>
where
    F: FnMut(f32, usize) + Send + 'static,
{
    // When another app is using the microphone (Discord, Zoom, etc.), opening the stream
    // can temporarily fail (depending on device/driver/exclusive mode). We'll retry a bit.
    const RETRIES: usize = 6;
    const RETRY_SLEEP_MS: u64 = 250;

    let stop = Arc::clone(stop);
    let host = cpal::default_host();
    let device = host
        .default_input_device()
        .ok_or_else(|| "no default input device".to_string())?;
    let config = device.default_input_config().map_err(|e| e.to_string())?;
    let sample_format = config.sample_format();
    let cfg: cpal::StreamConfig = config.clone().into();
    let channels = cfg.channels as usize;
    let sample_rate_hz = cfg.sample_rate.0;

    let samples = Arc::new(Mutex::new(Vec::<f32>::new()));
    let samples_cb = samples.clone();

    let mut last_err: Option<String> = None;
    let mut stream_opt = None;

    for attempt in 0..RETRIES {
        let res = match sample_format {
            SampleFormat::F32 | SampleFormat::I16 | SampleFormat::U16 => build_stream_with_level_cb(
                &device,
                &cfg,
                sample_format,
                channels,
                stop.clone(),
                samples_cb.clone(),
                on_level.take(),
            ),
            other => {
                return Err(format!(
                    "unsupported microphone sample format {other:?} (device must expose f32, i16, or u16)"
                ));
            }
        };

        match res {
            Ok(s) => {
                stream_opt = Some(s);
                break;
            }
            Err(e) => {
                last_err = Some(e.to_string());
                tracing::warn!(
                    "mic stream open failed (attempt {}/{RETRIES}): {}",
                    attempt + 1,
                    last_err.as_deref().unwrap_or("unknown error")
                );
                thread::sleep(Duration::from_millis(RETRY_SLEEP_MS));
            }
        }
    }

    let stream = stream_opt.ok_or_else(|| {
        last_err.unwrap_or_else(|| "failed to open microphone stream".to_string())
    })?;

    stream.play().map_err(|e| e.to_string())?;
    while !stop.load(Ordering::Relaxed) {
        thread::sleep(Duration::from_millis(25));
    }
    drop(stream);
    thread::sleep(Duration::from_millis(80));
    let out = std::mem::take(&mut *samples.lock().unwrap());
    Ok(CapturedAudio {
        samples: out,
        sample_rate_hz,
    })
}
