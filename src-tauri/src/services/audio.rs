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

/// Records mono `f32` samples until `stop` is set to `true`, then stops the stream.
pub fn record_while_stopped<F>(
    stop: &Arc<AtomicBool>,
    mut on_level: Option<F>,
) -> Result<CapturedAudio, String>
where
    F: FnMut(f32) + Send + 'static,
{
    let stop = Arc::clone(stop);
    let stop_f32 = stop.clone();
    let stop_i16 = stop.clone();
    let host = cpal::default_host();
    let device = host
        .default_input_device()
        .ok_or_else(|| "no default input device".to_string())?;
    let config = device
        .default_input_config()
        .map_err(|e| e.to_string())?;
    let sample_format = config.sample_format();
    let cfg: cpal::StreamConfig = config.clone().into();
    let channels = cfg.channels as usize;
    let sample_rate_hz = cfg.sample_rate.0;

    let samples = Arc::new(Mutex::new(Vec::<f32>::new()));
    let samples_cb = samples.clone();
    let err_fn = |e| tracing::warn!("cpal stream error: {e}");

    let stream = match sample_format {
        SampleFormat::F32 => device
            .build_input_stream(
                &cfg,
                move |data: &[f32], _| {
                    if stop_f32.load(Ordering::Relaxed) {
                        return;
                    }
                    if let Some(cb) = on_level.as_mut() {
                        // quick RMS over this chunk (mono or averaged)
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
                            let rms = (sum / n as f32).sqrt();
                            cb(rms);
                        }
                    }
                    if channels == 1 {
                        samples_cb.lock().unwrap().extend_from_slice(data);
                    } else {
                        for frame in data.chunks(channels) {
                            let m = frame.iter().copied().sum::<f32>() / channels.max(1) as f32;
                            samples_cb.lock().unwrap().push(m);
                        }
                    }
                },
                err_fn,
                None,
            )
            .map_err(|e| e.to_string())?,
        SampleFormat::I16 => device
            .build_input_stream(
                &cfg,
                move |data: &[i16], _| {
                    if stop_i16.load(Ordering::Relaxed) {
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
                            let rms = (sum / n as f32).sqrt();
                            cb(rms);
                        }
                    }
                    let mut lock = samples_cb.lock().unwrap();
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
            )
            .map_err(|e| e.to_string())?,
        other => {
            return Err(format!(
                "unsupported microphone sample format {other:?} (try a device that exposes f32 or i16)"
            ));
        }
    };

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
