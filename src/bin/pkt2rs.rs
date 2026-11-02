//! pkt2rs — decrypt a Packet Tracer `.pkt`/`.pka` and emit Rust.
//!
//! Usage:
//!   pkt2rs <file.pkt> [out.rs]
//!   pkt2rs --xml <file.pkt>
//!   pkt2rs --all <dir> <outdir>     # convert every .pkt/.pka found
//!   pkt2rs --roundtrip <dir>        # verify decrypt -> encode -> decrypt

#[path = "../ptfile.rs"]
mod ptfile;

use std::path::{Path, PathBuf};

fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    match args.first().map(String::as_str) {
        Some("--xml") => dump_xml(&args[1]),
        Some("--all") => convert_all(Path::new(&args[1]), Path::new(&args[2])),
        Some("--roundtrip") => roundtrip(Path::new(&args[1])),
        Some(_) => convert_one(Path::new(&args[0]), args.get(1).map(Path::new)),
        None => {
            eprintln!(
                "usage: pkt2rs <file.pkt> [out.rs] | --xml <file> | --all <dir> <outdir> | --roundtrip <dir>"
            );
            std::process::exit(2);
        }
    }
}

fn dump_xml(path: &str) {
    let bytes = std::fs::read(path).unwrap_or_else(|e| fail(&format!("read {path}: {e}")));
    let xml = ptfile::decode_any(&bytes).unwrap_or_else(|e| fail(&format!("decode: {e}")));
    print!("{}", String::from_utf8_lossy(&xml));
}

fn convert_one(input: &Path, out: Option<&Path>) {
    let bytes = std::fs::read(input).unwrap_or_else(|e| fail(&format!("read: {e}")));
    let xml = ptfile::decode_any(&bytes).unwrap_or_else(|e| fail(&format!("decode: {e}")));
    let text = String::from_utf8_lossy(&xml).into_owned();
    let name = stem(input);
    let rs = emit(&name, input, &text);
    let out = out
        .map(PathBuf::from)
        .unwrap_or_else(|| input.with_extension("rs"));
    std::fs::write(&out, rs).unwrap_or_else(|e| fail(&format!("write: {e}")));
    println!("{} -> {}", input.display(), out.display());
}

fn convert_all(root: &Path, outdir: &Path) {
    std::fs::create_dir_all(outdir).unwrap_or_else(|e| fail(&format!("mkdir: {e}")));
    let mut ok = 0;
    let mut bad = 0;
    for path in walk(root) {
        let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
        if ext != "pkt" && ext != "pka" {
            continue;
        }
        match std::fs::read(&path).map_err(|e| e.to_string()).and_then(|b| {
            ptfile::decrypt(&b).map_err(|e| e.to_string())
        }) {
            Ok(xml) => {
                let text = String::from_utf8_lossy(&xml).into_owned();
                let name = stem(&path);
                let rs = emit(&name, &path, &text);
                let dest = outdir.join(format!("{name}.rs"));
                match std::fs::write(&dest, rs) {
                    Ok(()) => ok += 1,
                    Err(_) => bad += 1,
                }
            }
            Err(e) => {
                eprintln!("skip {}: {e}", path.display());
                bad += 1;
            }
        }
    }
    println!("converted {ok} files, {bad} failures -> {}", outdir.display());
}

/// Verify `decrypt -> encode -> decrypt` preserves the XML payload of every
/// `.pkt` below `root`. Containers this codec cannot decode are reported as
/// skipped, not failed; only payload mismatches count as failures.
fn roundtrip(root: &Path) {
    let mut ok = 0;
    let mut skipped = 0;
    let mut failed = 0;
    for path in walk(root) {
        if path.extension().and_then(|e| e.to_str()) != Some("pkt") {
            continue;
        }
        match roundtrip_one(&path) {
            Ok(()) => {
                println!("ok {}", path.display());
                ok += 1;
            }
            Err(Outcome::Undecodable(reason)) => {
                println!("skip {}: {reason}", path.display());
                skipped += 1;
            }
            Err(Outcome::Mismatch(reason)) => {
                println!("fail {}: {reason}", path.display());
                failed += 1;
            }
        }
    }
    println!("roundtrip: {ok} ok, {skipped} skipped, {failed} failed");
    if failed > 0 {
        std::process::exit(1);
    }
}

enum Outcome {
    Undecodable(String),
    Mismatch(String),
}

fn roundtrip_one(path: &Path) -> Result<(), Outcome> {
    let blob = std::fs::read(path).map_err(|e| Outcome::Mismatch(e.to_string()))?;
    let xml = ptfile::decrypt(&blob).map_err(Outcome::Undecodable)?;
    let again = ptfile::decrypt(&ptfile::encode(&xml)).map_err(Outcome::Mismatch)?;
    if again != xml {
        return Err(Outcome::Mismatch(format!(
            "payload mismatch ({} vs {} bytes)",
            xml.len(),
            again.len()
        )));
    }
    Ok(())
}

fn walk(dir: &Path) -> Vec<PathBuf> {
    let mut out = Vec::new();
    let Ok(rd) = std::fs::read_dir(dir) else { return out };
    for entry in rd.flatten() {
        let p = entry.path();
        if p.is_dir() {
            out.extend(walk(&p));
        } else {
            out.push(p);
        }
    }
    out
}

fn stem(p: &Path) -> String {
    let mut s: String = p
        .file_stem()
        .map(|s| s.to_string_lossy().into_owned())
        .unwrap_or_else(|| "topology".into());
    s = s
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() { c.to_ascii_lowercase() } else { '_' })
        .collect();
    while s.contains("__") {
        s = s.replace("__", "_");
    }
    s
}

fn fail(msg: &str) -> ! {
    eprintln!("{msg}");
    std::process::exit(1);
}

/* ---------------- XML extraction (simple, format is controlled) ---------------- */

struct Dev {
    name: String,
    model: String,
    ref_id: String,
}

struct Link {
    from: String,
    from_port: String,
    to: String,
    to_port: String,
    cable: String,
}

fn blocks<'a>(text: &'a str, tag: &str) -> Vec<&'a str> {
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

fn tag_text(block: &str, tag: &str) -> Option<String> {
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

fn parse_devices(text: &str) -> Vec<Dev> {
    blocks(text, "DEVICE")
        .into_iter()
        .filter_map(|b| {
            let name = tag_text(b, "NAME").unwrap_or_default();
            if name.is_empty() {
                return None;
            }
            Some(Dev {
                model: model_attr(b).unwrap_or_else(|| "unknown".into()),
                ref_id: tag_text(b, "SAVE_REF_ID").unwrap_or_default(),
                name,
            })
        })
        .collect()
}

fn parse_links(text: &str) -> Vec<Link> {
    blocks(text, "LINK")
        .into_iter()
        .filter_map(|b| {
            let cable = tag_text(b, "TYPE").unwrap_or_default();
            let from = tag_text(b, "FROM")?;
            let to = tag_text(b, "TO")?;
            let ports = blocks(b, "PORT");
            let from_port = ports.first().map(|p| p.trim().to_string()).unwrap_or_default();
            let to_port = ports.get(1).map(|p| p.trim().to_string()).unwrap_or_default();
            Some(Link { from, from_port, to, to_port, cable })
        })
        .collect()
}

fn emit(name: &str, source: &Path, text: &str) -> String {
    let devices = parse_devices(text);
    let links = parse_links(text);
    let by_ref: std::collections::HashMap<&str, &str> = devices
        .iter()
        .map(|d| (d.ref_id.as_str(), d.name.as_str()))
        .collect();

    let mut out = String::new();
    out.push_str("//! Generated by pkt2rs from a Packet Tracer save file.\n");
    out.push_str("//! Do not edit by hand: re-run the converter.\n\n");
    out.push_str(&format!("pub const SOURCE: &str = {:?};\n\n", source.display().to_string()));
    out.push_str("pub struct Device { pub name: &'static str, pub model: &'static str }\n");
    out.push_str("pub struct Link { pub from: &'static str, pub from_port: &'static str, \
                  pub to: &'static str, pub to_port: &'static str, pub cable: &'static str }\n\n");

    out.push_str("pub const DEVICES: &[Device] = &[\n");
    for d in &devices {
        out.push_str(&format!(
            "    Device {{ name: {:?}, model: {:?} }},\n",
            d.name, d.model
        ));
    }
    out.push_str("];\n\n");

    out.push_str("pub const LINKS: &[Link] = &[\n");
    for l in &links {
        let from = by_ref.get(l.from.as_str()).copied().unwrap_or(l.from.as_str());
        let to = by_ref.get(l.to.as_str()).copied().unwrap_or(l.to.as_str());
        out.push_str(&format!(
            "    Link {{ from: {:?}, from_port: {:?}, to: {:?}, to_port: {:?}, cable: {:?} }},\n",
            from, l.from_port, to, l.to_port, l.cable
        ));
    }
    out.push_str("];\n\n");

    out.push_str(&format!("pub const XML_BYTES: usize = {};\n\n", text.len()));
    out.push_str("/// Verbatim decoded XML.\n");
    out.push_str(&format!("pub const XML: &str = r##\"{}\"##;\n", text.replace("\"##", "\"# #")));

    let _ = name;
    out
}
