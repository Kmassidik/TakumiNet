use super::super::*;
use std::time::Instant;

const V1: &str = include_str!("../../../tests/fixtures/native_v1.tnet");

fn document(records: &str) -> String {
    format!("<takuminet version=\"1\">\n{records}\n</takuminet>\n")
}

fn one_device(id: &str) -> String {
    format!("<device id=\"{id}\" kind=\"pc\" model=\"PC-PT\" x=\"1\" y=\"2\" name=\"PC\" ip=\"\" prefix=\"24\"/>")
}

#[test]
fn l29_thirty_broken_files_have_located_problems() {
    let cases = [
        "".to_string(),
        "<wrong version=\"1\"/>".into(),
        "<takuminet></takuminet>".into(),
        document("").replace("version=\"1\"", "version=\"2\""),
        document("").replace("version=\"1\"", "version=\"next\""),
        "<!DOCTYPE takuminet><takuminet version=\"1\"></takuminet>".into(),
        "<!ENTITY x \"y\"><takuminet version=\"1\"></takuminet>".into(),
        document("<device id=\"&bogus;\"/>") ,
        document("<device id=\"a\" id=\"b\"/>") ,
        "<takuminet version=\"1\">".into(),
        document(&(one_device("pc0") + "\n" + &one_device("pc0"))),
        document("<device id=\"pc0\" kind=\"pc\" model=\"No Such Model\" x=\"1\" y=\"2\" name=\"PC\" ip=\"\" prefix=\"24\"/>") ,
        document("<device id=\"pc0\" kind=\"pc\" model=\"PC-PT\" x=\"1\" y=\"2\" name=\"PC\" ip=\"999.1.1.1\" prefix=\"24\"/>") ,
        document("<device id=\"pc0\" kind=\"pc\" model=\"PC-PT\" x=\"1\" y=\"2\" name=\"PC\" ip=\"\" prefix=\"255.0.255.0\"/>") ,
        document("<device id=\"pc0\" kind=\"pc\" model=\"PC-PT\" x=\"north\" y=\"2\" name=\"PC\" ip=\"\" prefix=\"24\"/>") ,
        document(&(one_device("pc0") + "\n<link a=\"missing\" a_port=\"Fa0\" b=\"pc0\" b_port=\"Fa0\" kind=\"eCopper\"/>") ),
        document("<link a=\"missing\" a_port=\"Fa0\" b=\"also-missing\" b_port=\"Fa0\" kind=\"eCopper\"/>") ,
        document(&(one_device("pc0") + "\n" + &one_device("pc1") + "\n<link a=\"pc0\" a_port=\"Bad0\" b=\"pc1\" b_port=\"Fa0\" kind=\"eCopper\"/>") ),
        document(&(one_device("pc0") + "\n" + &one_device("pc1") + "\n<link a=\"pc0\" a_port=\"Fa0\" b=\"pc1\" b_port=\"Bad0\" kind=\"eCopper\"/>") ),
        document(&(one_device("pc0") + "\n" + &one_device("pc1") + "\n<link a=\"pc0\" a_port=\"Fa0\" b=\"pc1\" b_port=\"Fa0\" kind=\"eCopper\"/>\n<link a=\"pc0\" a_port=\"Fa0\" b=\"pc1\" b_port=\"Fa0\" kind=\"eCopper\"/>") ),
        document(&(one_device("pc0") + "\n<port id=\"pc0\" name=\"Fa0\" up=\"1\" ip=\"bad\" prefix=\"24\" vlan=\"1\" trunk=\"0\" dot1q=\"\" bandwidth_kbps=\"100000\" delay_us=\"100\"/>") ),
        document(&(one_device("pc0") + "\n<port id=\"pc0\" name=\"Fa0\" up=\"1\" ip=\"\" prefix=\"33\" vlan=\"1\" trunk=\"0\" dot1q=\"\" bandwidth_kbps=\"100000\" delay_us=\"100\"/>") ),
        document(&(one_device("pc0") + "\n<port id=\"pc0\" name=\"Fa0\" up=\"1\" ip=\"\" prefix=\"24\" vlan=\"0\" trunk=\"0\" dot1q=\"\" bandwidth_kbps=\"100000\" delay_us=\"100\"/>") ),
        document(&(one_device("pc0") + "\n<port id=\"pc0\" name=\"Fa0\" up=\"1\" ip=\"\" prefix=\"24\" vlan=\"4095\" trunk=\"0\" dot1q=\"\" bandwidth_kbps=\"100000\" delay_us=\"100\"/>") ),
        document(&(one_device("pc0") + "\n<vlan id=\"pc0\" vlan=\"0\" name=\"bad\"/>") ),
        document(&(one_device("pc0") + "\n<route id=\"pc0\" net=\"bad\" prefix=\"24\" via=\"192.168.1.1\" admin_distance=\"1\"/>") ),
        document(&(one_device("pc0") + "\n<route id=\"pc0\" net=\"192.168.1.0\" prefix=\"24\" via=\"bad\" admin_distance=\"1\"/>") ),
        document(&(one_device("pc0") + "\n<pool id=\"pc0\" network=\"bad\" prefix=\"24\" gw=\"\" dns=\"\"/>") ),
        document(&(one_device("pc0") + "\n<net id=\"pc0\" gw=\"bad\" dns=\"\"/>") ),
        document("<a><b><c><d><e><f><g><h><i/></h></g></f></e></d></c></b></a>"),
    ];
    assert_eq!(cases.len(), 30);
    for (index, text) in cases.iter().enumerate() {
        let problems = match Workspace::from_tnet(text) {
            Ok(_) => panic!("broken file must be rejected"),
            Err(problems) => problems,
        };
        assert!(!problems.is_empty(), "case {index}");
        for problem in problems {
            assert!(problem.line > 0, "case {index}: {problem}");
            assert!(!problem.element.is_empty(), "case {index}: {problem}");
            assert!(!problem.attribute.is_empty(), "case {index}: {problem}");
            let rendered = problem.to_string();
            assert!(rendered.contains(&format!("line {}", problem.line)), "case {index}: {rendered}");
            assert!(rendered.contains(&format!("<{}>", problem.element)), "case {index}: {rendered}");
        }
    }
}

#[test]
fn l30_five_thousand_mutations_are_all_or_nothing() {
    let mut seed = 0xd1b5_4a32_d192_ed03u64;
    let mut random = move || {
        seed ^= seed << 13;
        seed ^= seed >> 7;
        seed ^= seed << 17;
        seed
    };
    for iteration in 0..5000 {
        let mut bytes = V1.as_bytes().to_vec();
        match random() % 4 {
            0 if !bytes.is_empty() => {
                let at = random() as usize % bytes.len();
                bytes.remove(at);
            }
            1 if !bytes.is_empty() => {
                let at = random() as usize % bytes.len();
                let byte = bytes[at];
                bytes.insert(at, byte);
            }
            2 if bytes.len() > 1 => {
                let a = random() as usize % bytes.len();
                let b = random() as usize % bytes.len();
                bytes.swap(a, b);
            }
            _ => {
                let mut lines: Vec<Vec<u8>> = bytes.split(|b| *b == b'\n').map(<[u8]>::to_vec).collect();
                if lines.len() > 1 {
                    let a = random() as usize % lines.len();
                    let b = random() as usize % lines.len();
                    lines.swap(a, b);
                }
                bytes = lines.join(&b'\n');
            }
        }
        let text = String::from_utf8_lossy(&bytes);
        let loaded = std::panic::catch_unwind(|| Workspace::from_tnet(&text));
        assert!(loaded.is_ok(), "mutation {iteration} panicked");
        if let Ok(ws) = loaded.unwrap() {
            let saved = ws.to_tnet();
            let reloaded = Workspace::from_tnet(&saved)
                .unwrap_or_else(|problems| panic!("mutation {iteration} produced partial workspace: {problems:?}"));
            assert_eq!(reloaded.to_tnet(), saved, "mutation {iteration} was not stable");
        }
    }
}

#[test]
fn l31_versions_migrate_and_newer_versions_are_rejected() {
    let migrated = Workspace::from_tnet(&V1.replacen("version=\"1\"", "version=\"0\"", 1)).unwrap();
    assert!(migrated.to_tnet().starts_with("<takuminet version=\"1\">\n"));
    assert_eq!(Workspace::from_tnet(&migrated.to_tnet()).unwrap().to_tnet(), migrated.to_tnet());
    let frozen = Workspace::from_tnet(V1).unwrap();
    assert_eq!(frozen.to_tnet(), V1);
    let newer = match Workspace::from_tnet(&V1.replacen("version=\"1\"", "version=\"2\"", 1)) {
        Ok(_) => panic!("newer version must be rejected"),
        Err(problems) => problems,
    };
    assert!(newer.iter().any(|p| p.message.contains("made by a newer TakumiNet")));
}

#[test]
fn l32_unknown_attributes_and_elements_survive() {
    let text = document("<device id=\"pc0\" kind=\"pc\" model=\"PC-PT\" x=\"1\" y=\"2\" name=\"PC\" ip=\"\" prefix=\"24\" future=\"yes\" vendor=\"example\" z=\"last\"/>\n<future flag=\"1\"><child value=\"&#10;\"/></future>");
    let ws = Workspace::from_tnet(&text).unwrap();
    let saved = ws.to_tnet();
    assert!(saved.contains("future=\"yes\" vendor=\"example\" z=\"last\""), "{saved}");
    assert!(saved.contains("<future flag=\"1\"><child value=\"&#10;\"/></future>"), "{saved}");
    assert_eq!(Workspace::from_tnet(&saved).unwrap().to_tnet(), saved);
}

#[test]
fn open_anyway_drops_only_broken_records_and_reports() {
    let text = document("<device id=\"bad\" kind=\"pc\" model=\"PC-PT\" x=\"1\" y=\"2\" name=\"Bad\" ip=\"bad\" prefix=\"24\"/>\n<device id=\"good\" kind=\"pc\" model=\"PC-PT\" x=\"3\" y=\"4\" name=\"Good\" ip=\"192.168.1.2\" prefix=\"24\"/>\n<link a=\"bad\" a_port=\"Fa0\" b=\"good\" b_port=\"Fa0\" kind=\"eCopper\"/>");
    assert!(Workspace::from_tnet(&text).is_err());
    let recovered = Workspace::from_tnet_open_anyway(&text).unwrap();
    assert_eq!(recovered.devices.len(), 1);
    assert_eq!(recovered.devices[0].id, "good");
    assert!(recovered.links.is_empty());
    assert!(recovered.load_problems.len() >= 2);
}

#[test]
fn duplicate_ip_is_a_warning_not_an_error() {
    let text = document("<device id=\"pc0\" kind=\"pc\" model=\"PC-PT\" x=\"1\" y=\"2\" name=\"PC0\" ip=\"192.168.1.2\" prefix=\"24\"/>\n<device id=\"pc1\" kind=\"pc\" model=\"PC-PT\" x=\"3\" y=\"4\" name=\"PC1\" ip=\"192.168.1.2\" prefix=\"24\"/>");
    let ws = Workspace::from_tnet(&text).unwrap();
    assert!(ws.load_problems.iter().any(|p| p.severity == ProblemSeverity::Warning));
}

#[test]
fn l33_resource_limits_reject_within_200ms() {
    let big = " ".repeat(9 * 1024 * 1024);
    let deep = format!("<takuminet version=\"1\">{}x{}</takuminet>", "<a>".repeat(10_000), "</a>".repeat(10_000));
    for (label, text) in [("9 MB", &big), ("10,000-deep", &deep)] {
        let start = Instant::now();
        assert!(Workspace::from_tnet(text).is_err());
        let elapsed = start.elapsed();
        println!("L33 {label} rejection: {:.3} ms", elapsed.as_secs_f64() * 1000.0);
        assert!(elapsed.as_millis() < 200, "limit took {elapsed:?}");
    }
    let too_many_devices = document(&(0..2001).map(|n| one_device(&format!("pc{n}"))).collect::<Vec<_>>().join("\n"));
    assert!(Workspace::from_tnet(&too_many_devices).is_err());
    let too_many_records = document(&"<future/>".repeat(20_001));
    assert!(Workspace::from_tnet(&too_many_records).is_err());
}
