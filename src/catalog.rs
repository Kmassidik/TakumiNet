//! Device catalogue read from Packet Tracer's own `.ptd` templates.
//!
//! Each template is the same container as a `.pkt` save (see `ptfile`), holding
//! XML that names one device model, its description, its OS image and the slot
//! tree it exposes. Loading them means the palette's model list, names and
//! descriptions come from the shipped data instead of a hard-coded table.
//!
//! Port counts are *not* in a template — they live in the binary's device
//! tables — so `Model::slots` is the only structural fact a template carries.

use std::path::Path;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Model {
    /// `model` attribute, e.g. `2960-24TT`.
    pub label: String,
    /// Engine type in lower case: `router`, `switch`, `pc`, `server`, …
    pub kind: String,
    /// Display name, e.g. `2960 IOS15`.
    pub name: String,
    pub description: String,
    /// `OS_IMAGE`, empty when the template ships none.
    pub os_image: String,
    /// `subGroup` attribute: `Routers`, `Switches`, `EndDevices`, …
    pub group: String,
    /// Number of `<SLOT>` entries (module capacity).
    pub slots: usize,
}

impl Model {
    /// GNU-style label the palette shows.
    pub fn tile(&self) -> &str {
        if self.name.is_empty() {
            &self.label
        } else {
            &self.name
        }
    }
}

/// First `<name …>inner</name>` pair in `xml`.
fn slice_tag<'a>(xml: &'a str, name: &str) -> Option<(&'a str, &'a str)> {
    let open = format!("<{name}");
    let close = format!("</{name}>");
    let start = xml.find(&open)?;
    let after = xml[start..].find('>')? + start + 1;
    let end = xml[after..].find(&close)? + after;
    Some((&xml[start..after], &xml[after..end]))
}

/// Value of `name="…"` inside an opening tag.
fn attr<'a>(open: &'a str, name: &str) -> Option<&'a str> {
    let pat = format!("{name}=\"");
    let s = open.find(&pat)? + pat.len();
    let e = open[s..].find('"')? + s;
    Some(&open[s..e])
}

/// Normalise PT's engine type to the kinds the workspace already uses.
fn kind_of(engine: &str) -> String {
    match engine.trim().to_ascii_lowercase().as_str() {
        "router" => "router".into(),
        "switch" | "multilayerswitch" | "multilayer switch" => "switch".into(),
        "hub" => "hub".into(),
        "accesspoint" | "access point" => "ap".into(),
        "wirelessrouter" | "wireless router" | "homerouter" => "homerouter".into(),
        "pc" | "workstation" => "pc".into(),
        "laptop" => "laptop".into(),
        "server" => "server".into(),
        "printer" => "printer".into(),
        "ip phone" | "ipphone" | "phone" => "phone".into(),
        "asa" | "firewall" => "asa".into(),
        "wlc" | "wireless lan controller" => "wlc".into(),
        "plc" | "industrial" => "plc".into(),
        "mcucomponent" | "thing" | "iot" | "iotdevice" => "thing".into(),
        "cloud" => "cloud".into(),
        "sniffer" => "sniffer".into(),
        "tv" => "tv".into(),
        other => other.replace(' ', ""),
    }
}

fn element_text(xml: &str, name: &str) -> String {
    slice_tag(xml, name)
        .map(|(_, inner)| inner.trim().to_string())
        .unwrap_or_default()
}

/// Parse one decoded template.
pub fn parse(xml: &str) -> Option<Model> {
    let (type_open, type_text) = slice_tag(xml, "TYPE")?;
    let label = attr(type_open, "model").unwrap_or_default().trim().to_string();
    if label.is_empty() {
        return None;
    }
    let group = xml
        .lines()
        .next()
        .and_then(|line| attr(line, "subGroup"))
        .unwrap_or_default()
        .to_string();
    Some(Model {
        kind: kind_of(type_text),
        name: element_text(xml, "NAME"),
        description: element_text(xml, "DESCRIPTION"),
        os_image: element_text(xml, "OS_IMAGE"),
        group,
        slots: xml.matches("<SLOT>").count(),
        label,
    })
}

/// Decode and parse every `.ptd` in `dir`, sorted by group then label.
pub fn load(dir: &Path) -> Vec<Model> {
    let Ok(rd) = std::fs::read_dir(dir) else {
        return Vec::new();
    };
    let mut out = Vec::new();
    for entry in rd.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("ptd") {
            continue;
        }
        let Ok(bytes) = std::fs::read(&path) else {
            continue;
        };
        let Ok(xml) = crate::ptfile::decrypt(&bytes) else {
            continue;
        };
        let Ok(text) = String::from_utf8(xml) else {
            continue;
        };
        if let Some(model) = parse(&text) {
            out.push(model);
        }
    }
    out.sort_by(|a, b| (a.group.as_str(), a.label.as_str()).cmp(&(b.group.as_str(), b.label.as_str())));
    out
}

/// Load from the discovered asset tree, if one is present.
pub fn load_assets() -> Vec<Model> {
    let Some(assets) = crate::assets::Assets::discover() else {
        return Vec::new();
    };
    load(&assets.root.join("templates"))
}

fn js(s: &str) -> String {
    let mut o = String::with_capacity(s.len() + 2);
    o.push('"');
    for c in s.chars() {
        match c {
            '"' => o.push_str("\\\""),
            '\\' => o.push_str("\\\\"),
            c if (c as u32) < 0x20 => o.push_str(&format!("\\u{:04x}", c as u32)),
            c => o.push(c),
        }
    }
    o.push('"');
    o
}

pub fn to_json(models: &[Model]) -> String {
    let mut o = String::from("{\"models\":[");
    for (i, m) in models.iter().enumerate() {
        if i > 0 {
            o.push(',');
        }
        o.push_str(&format!(
            "{{\"label\":{},\"kind\":{},\"name\":{},\"description\":{},\"osImage\":{},\"group\":{},\"slots\":{}}}",
            js(&m.label),
            js(&m.kind),
            js(&m.name),
            js(&m.description),
            js(&m.os_image),
            js(&m.group),
            m.slots
        ));
    }
    o.push_str("]}");
    o
}

#[cfg(test)]
mod tests {
    use super::*;

    const FIXTURE: &str = r#"<PACKETTRACER templateType="COMPONENT" displayOrder="100" subGroup="Switches">
 <VERSION>9.0.1.0000</VERSION>
 <NETWORK><DEVICES><DEVICE><ENGINE>
  <TYPE model="2960-24TT">Switch</TYPE>
  <NAME>2960 IOS15</NAME>
  <DESCRIPTION>2960 with IOS15 preinstalled</DESCRIPTION>
  <MODULE><TYPE>eNonRemovableModule</TYPE><MODEL/><SLOT><TYPE>eNonRemovableModule</TYPE></SLOT></MODULE>
  <OS_IMAGE>2960_15.0_SE4</OS_IMAGE>
 </ENGINE></DEVICE></DEVICES></NETWORK>
</PACKETTRACER>"#;

    #[test]
    fn parses_the_shipped_template_shape() {
        let m = parse(FIXTURE).expect("parse");
        assert_eq!(m.label, "2960-24TT");
        assert_eq!(m.kind, "switch");
        assert_eq!(m.name, "2960 IOS15");
        assert_eq!(m.description, "2960 with IOS15 preinstalled");
        assert_eq!(m.os_image, "2960_15.0_SE4");
        assert_eq!(m.group, "Switches");
        assert_eq!(m.slots, 1);
        assert_eq!(m.tile(), "2960 IOS15");
    }

    #[test]
    fn template_container_round_trips() {
        let packed = crate::ptfile::encrypt(FIXTURE.as_bytes());
        assert_ne!(&packed[..16], &FIXTURE.as_bytes()[..16], "must be encrypted");
        let back = crate::ptfile::decrypt(&packed).expect("decrypt");
        assert_eq!(String::from_utf8(back).unwrap(), FIXTURE);
        assert_eq!(parse(FIXTURE), parse(&String::from_utf8(crate::ptfile::decrypt(&packed).unwrap()).unwrap()));
    }

    #[test]
    fn rejects_non_templates() {
        assert!(parse("<HTML><BODY>nope</BODY></HTML>").is_none());
        assert!(parse("").is_none());
    }

    #[test]
    fn loads_the_extracted_tree_when_present() {
        let models = load_assets();
        if models.is_empty() {
            return; // assets not unpacked on this machine
        }
        // 63 of the 89 shipped templates decode; the other 26 are IoT/home
        // templates that use a container variant we have not identified yet.
        assert!(models.len() >= 60, "only {} templates", models.len());
        assert!(models.iter().any(|m| m.label == "2960-24TT"));
        assert!(models.iter().any(|m| m.kind == "router"));
        assert!(models.iter().any(|m| m.kind == "thing"));
        assert!(models.iter().all(|m| !m.label.is_empty()));
    }
}
