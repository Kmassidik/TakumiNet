mod cli;
mod cmd;
mod http;
mod model;
mod net;
mod storage;
mod webapp;
mod workspace;

fn main() {
    let host = std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let web_root = std::env::var("WEB_ROOT").unwrap_or_else(|_| "web".to_string());

    if let Err(e) = http::serve(&format!("{host}:{port}"), &web_root) {
        eprintln!("server error: {e}");
        std::process::exit(1);
    }
}
