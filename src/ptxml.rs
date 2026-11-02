//! Typed view over the XML inside a `.pkt`/`.pka` file.
//!
//! Deliberately a tag scanner, not a full XML model: the decoded format is
//! stable and this keeps the dependency surface at zero. Anything not typed
//! here is still preserved verbatim by `pkt2rs`.

#[derive(Clone, Debug, PartialEq)]
pub struct PktDevice {
    pub name: String,
    pub model: String,
    pub kind: String,
    pub x: f32,
    pub y: f32,
    pub ref_id: String,
}

#[derive(Clone, Debug, PartialEq)]
pub struct PktLink {
    pub from: String,
    pub from_port: String,
    pub to: String,
    pub to_port: String,
    pub cable: String,
}

#[derive(Clone, Debug, Default)]
pub struct PktTopology {
    pub version: String,
    pub devices: Vec<PktDevice>,
    pub links: Vec<PktLink>,
}

pub fn blocks<'a>(text: &'a str, tag: &str) -> Vec<&'a str> {
    let open = format!("<{tag}>");
    let close = format!("</{tag}>");
    let mut out = Vec::new();
    let mut rest = text;
    while let Some(start) = rest.find(&open) {
        let after = &rest[start + open.len()..];
        let Some(end) = after.find(&close) else { break };
        out.push(&after[..end]);
        rest = &after[end + close.len()..];
    }
    out
}

pub fn tag_text(block: &str, tag: &str) -> Option<String> {
    let open = format!("<{tag}");
    let start = block.find(&open)?;
    let gt = block[start..].find('>')? + start;
    let after = &block[gt + 1..];
    let end = after.find(&format!("</{tag}>"))?;
    Some(after[..end].trim().to_string())
}

fn model_attr(block: &str) -> Option<String> {
    let marker = "<TYPE model=\"";
    let start = block.find(marker)? + marker.len();
    let end = block[start..].find('"')? + start;
    Some(block[start..end].to_string())
}

/// Logical-workspace position: `<WORKSPACE><LOGICAL><X>..</X><Y>..</Y>`.
fn logical_pos(block: &str) -> Option<(f32, f32)> {
    let ws = blocks(block, "WORKSPACE").into_iter().next()?;
    let logical = blocks(ws, "LOGICAL").into_iter().next()?;
    let x = tag_text(logical, "X")?.parse().ok()?;
    let y = tag_text(logical, "Y")?.parse().ok()?;
    Some((x, y))
}

/// Maps a PT device type to our renderable kinds. `None` means "not a network
/// node we render" (power supplies, generic containers, sensors, …).
pub fn kind_for(model: &str, type_text: &str) -> Option<&'static str> {
    let t = format!("{} {}", type_text.to_ascii_lowercase(), model.to_ascii_lowercase());
    let k = if t.contains("access point") || t.contains("accesspoint") {
        "ap"
    } else if t.contains("router") && !t.contains("home router") {
        "router"
    } else if t.contains("switch") {
        "switch"
    } else if t.contains("hub") {
        "hub"
    } else if t.contains("server") {
        "server"
    } else if t.contains("laptop") {
        "laptop"
    } else if t.contains("printer") {
        "printer"
    } else if t.contains("cloud") {
        "cloud"
    } else if t.contains("asa") || t.contains("firewall") || t.contains("5505") || t.contains("5506") {
        "asa"
    } else if t.contains("pc") || t.contains("workstation") || t.contains("tablet") {
        "pc"
    } else if t.contains("phone") || t.contains("tv") || t.contains("pda") {
        "pc"
    } else {
        return None;
    };
    Some(k)
}

pub fn parse(xml: &str) -> PktTopology {
    let version = tag_text(xml, "VERSION").unwrap_or_default();

    let devices = blocks(xml, "DEVICE")
        .into_iter()
        .filter_map(|b| {
            let name = tag_text(b, "NAME").unwrap_or_default();
            if name.is_empty() {
                return None;
            }
            let model = model_attr(b).unwrap_or_else(|| "unknown".into());
            let type_text = tag_text(b, "TYPE").unwrap_or_default();
            let kind = kind_for(&model, &type_text)?;
            let (x, y) = logical_pos(b).unwrap_or((100.0, 100.0));
            Some(PktDevice {
                kind: kind.to_string(),
                name,
                model,
                x,
                y,
                ref_id: tag_text(b, "SAVE_REF_ID").unwrap_or_default(),
            })
        })
        .collect();

    let links = blocks(xml, "LINK")
        .into_iter()
        .filter_map(|b| {
            let from = tag_text(b, "FROM")?;
            let to = tag_text(b, "TO")?;
            let ports = blocks(b, "PORT");
            Some(PktLink {
                from,
                to,
                from_port: ports.first().map(|p| p.trim().to_string()).unwrap_or_default(),
                to_port: ports.get(1).map(|p| p.trim().to_string()).unwrap_or_default(),
                cable: tag_text(b, "TYPE").unwrap_or_default(),
            })
        })
        .collect();

    PktTopology { version, devices, links }
}

/// Short display names for PT interface strings.
pub fn abbrev_port(port: &str) -> String {
    let p = port
        .replace("GigabitEthernet", "Gig")
        .replace("FastEthernet", "Fa")
        .replace("Ethernet", "Eth")
        .replace("Serial", "Se")
        .replace("TenGigabitEthernet", "Te");
    if p.is_empty() { "Fa0".into() } else { p }
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = r#"
<PACKETTRACER5>
 <VERSION>7.3.1.0000</VERSION>
 <NETWORK><DEVICES>
  <DEVICE>
   <ENGINE>
    <TYPE model="1941" customModel="">Router</TYPE>
    <NAME>R1</NAME>
    <SAVE_REF_ID>save-ref-id:111</SAVE_REF_ID>
   </ENGINE>
   <WORKSPACE><LOGICAL><X>400</X><Y>120</Y></LOGICAL></WORKSPACE>
  </DEVICE>
  <DEVICE>
   <ENGINE>
    <TYPE model="2960-24TT" customModel="">Switch</TYPE>
    <NAME>SW1</NAME>
    <SAVE_REF_ID>save-ref-id:222</SAVE_REF_ID>
   </ENGINE>
   <WORKSPACE><LOGICAL><X>200</X><Y>300</Y></LOGICAL></WORKSPACE>
  </DEVICE>
 </DEVICES>
 <LINKS>
  <LINK>
   <TYPE>eCopper</TYPE>
   <CABLE><FROM>save-ref-id:111</FROM><PORT>GigabitEthernet0/0</PORT>
    <TO>save-ref-id:222</TO><PORT>FastEthernet0/1</PORT></CABLE>
  </LINK>
 </LINKS></NETWORK>
</PACKETTRACER5>"#;

    #[test]
    fn parses_devices_links_positions() {
        let t = parse(SAMPLE);
        assert_eq!(t.version, "7.3.1.0000");
        assert_eq!(t.devices.len(), 2);
        let r1 = &t.devices[0];
        assert_eq!(r1.name, "R1");
        assert_eq!(r1.model, "1941");
        assert_eq!(r1.kind, "router");
        assert_eq!((r1.x, r1.y), (400.0, 120.0));
        assert_eq!(t.devices[1].kind, "switch");

        assert_eq!(t.links.len(), 1);
        let l = &t.links[0];
        assert_eq!(l.from, "save-ref-id:111");
        assert_eq!(l.to, "save-ref-id:222");
        assert_eq!(l.cable, "eCopper");
        assert_eq!(abbrev_port(&l.from_port), "Gig0/0");
        assert_eq!(abbrev_port(&l.to_port), "Fa0/1");
    }

    #[test]
    fn kind_mapping() {
        assert_eq!(kind_for("PC-PT", "PC"), Some("pc"));
        assert_eq!(kind_for("Server-PT", "Server"), Some("server"));
        assert_eq!(kind_for("ASA5505", "ASA"), Some("asa"));
        assert_eq!(kind_for("Laptop-PT", "Laptop"), Some("laptop"));
        assert_eq!(kind_for("AP-PT", "Access Point"), Some("ap"));
        assert_eq!(kind_for("", "Power Distribution Device"), None);
    }
}
