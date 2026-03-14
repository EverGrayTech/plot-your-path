#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::{BufRead, BufReader, Read};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::thread;

use tauri::{AppHandle, Manager, RunEvent};

struct BackendProcess(Mutex<Option<Child>>);

fn backend_binary_name() -> &'static str {
    if cfg!(target_os = "windows") {
        "plot-your-path-backend.exe"
    } else {
        "plot-your-path-backend"
    }
}

fn pipe_output<R>(prefix: &'static str, stream: Option<R>)
where
    R: Read + Send + 'static,
{
    if let Some(stream) = stream {
        thread::spawn(move || {
            let reader = BufReader::new(stream);
            for line in reader.lines() {
                match line {
                    Ok(line) if !line.trim().is_empty() => println!("{} {}", prefix, line),
                    Ok(_) => {}
                    Err(error) => {
                        eprintln!("{} failed to read process output: {}", prefix, error);
                        break;
                    }
                }
            }
        });
    }
}

fn spawn_backend(app: &AppHandle) -> tauri::Result<()> {
    if cfg!(debug_assertions) {
        return Ok(());
    }

    let backend_path = app.path().resource_dir()?.join(backend_binary_name());
    let mut child = Command::new(backend_path)
        .env("PYP_DESKTOP_RUNTIME", "true")
        .env("PYP_BACKEND_LOG_LEVEL", "info")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()?;

    pipe_output("[backend]", child.stdout.take());
    pipe_output("[backend]", child.stderr.take());

    let state = app.state::<BackendProcess>();
    let mut guard = state.0.lock().expect("backend process mutex poisoned");
    *guard = Some(child);

    Ok(())
}

fn stop_backend(app: &AppHandle) {
    let state = app.state::<BackendProcess>();
    let mut guard = state.0.lock().expect("backend process mutex poisoned");

    if let Some(child) = guard.as_mut() {
        let _ = child.kill();
        let _ = child.wait();
    }

    *guard = None;
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(BackendProcess(Mutex::new(None)));
            Ok(spawn_backend(app.handle())?)
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if matches!(event, RunEvent::Exit | RunEvent::ExitRequested { .. }) {
                stop_backend(app);
            }
        });
}
