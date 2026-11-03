//! A tiny HTTP server/browser pair for the simulated network.
//!
//! A fetch is a real delivery: the client's request is forwarded hop by hop
//! (so the capture buffer records it), and only a `server` device answers.

use crate::workspace::Workspace;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Page {
    pub status: u16,
    pub reason: &'static str,
    pub host: String,
    pub title: String,
    pub text: String,
}

/// Strip the scheme and path so both `http://host/` and `host` work.
fn host_of(url: &str) -> &str {
    let rest = url
        .trim()
        .strip_prefix("http://")
        .or_else(|| url.trim().strip_prefix("https://"))
        .unwrap_or(url.trim());
    rest.split(['/', ':']).next().unwrap_or("")
}

/// Fetch `url` from `client`.
pub fn fetch(ws: &mut Workspace, client: &str, url: &str) -> Result<Page, String> {
    let host = host_of(url);
    if host.is_empty() {
        return Err("Invalid URL".into());
    }

    let Some(ip) = crate::model::parse_ipv4(host).or_else(|| ws.resolve_name(client, host)) else {
        return Err(format!("Request timed out: no host answers for {host}"));
    };
    let Some(server) = ws
        .devices
        .iter()
        .find(|d| d.ip == Some(ip) || d.ports.iter().any(|p| p.ip == Some(ip)))
        .map(|d| (d.id.clone(), d.name.clone(), d.kind.clone()))
    else {
        return Err(format!("Request timed out: no host answers for {host}"));
    };

    if server.2 != "server" {
        return Err(format!("Connection refused by {host} (no HTTP service)"));
    }

    let custom = ws.http_pages.get(&server.0).cloned();
    ws.send_pdu(client, &server.0)
        .map_err(|_| format!("Request timed out while reaching {host}"))?;

    if let Some(event) = ws.events.last_mut() {
        event.kind = "HTTP".into();
        event.proto = "HTTP".into();
    }

    Ok(Page {
        status: 200,
        reason: "OK",
        host: host.to_string(),
        title: server.1.clone(),
        text: custom.unwrap_or_else(|| {
            format!(
                "Welcome to {name}.\n\nThis page is served by the simulated HTTP server at {host}.\nRequests are forwarded through the same topology the packet engine uses.",
                name = server.1,
            )
        }),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn host_is_extracted_from_urls() {
        assert_eq!(host_of("http://192.168.2.20/"), "192.168.2.20");
        assert_eq!(host_of("192.168.2.20"), "192.168.2.20");
        assert_eq!(host_of("https://192.168.2.20:80/index.html"), "192.168.2.20");
        assert_eq!(host_of("   "), "");
    }

    #[test]
    fn a_browser_reaches_the_server_across_the_router() {
        let mut ws = Workspace::new();
        let page = fetch(&mut ws, "pc0", "http://192.168.2.20/").expect("fetch");
        assert_eq!(page.status, 200);
        assert_eq!(page.host, "192.168.2.20");
        assert!(page.title.contains("Server0"), "{page:?}");
        let last = ws.events.last().expect("captured");
        assert_eq!(last.proto, "HTTP");
        assert_eq!(last.at, "Server0");
    }

    #[test]
    fn a_server_serves_its_configured_page() {
        let mut ws = Workspace::new();
        assert!(ws.set_http_page("server0", "hello from server0"));
        let page = fetch(&mut ws, "pc0", "192.168.2.20").expect("fetch");
        assert_eq!(page.text, "hello from server0");
    }

    #[test]
    fn a_host_without_http_is_refused() {
        let mut ws = Workspace::new();
        let err = fetch(&mut ws, "pc0", "192.168.1.11").unwrap_err();
        assert!(err.contains("Connection refused"), "{err}");
    }

    #[test]
    fn unknown_addresses_time_out() {
        let mut ws = Workspace::new();
        let err = fetch(&mut ws, "pc0", "10.9.9.9").unwrap_err();
        assert!(err.contains("Request timed out"), "{err}");
    }

    #[test]
    fn a_broken_path_times_out() {
        let mut ws = Workspace::new();
        ws.set_port_up("router0", "GigabitEthernet0/0", false);
        let err = fetch(&mut ws, "pc0", "192.168.2.20").unwrap_err();
        assert!(err.contains("Request timed out"), "{err}");
    }
}
