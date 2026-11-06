use super::super::*;
use crate::workspace::palette::CATALOG;

#[test]
fn every_palette_model_survives_add_address_power_save_reload_and_remove() {
    let mut checked = 0;
    for (label, _, kind) in CATALOG {
        let mut ws = Workspace::empty();
        let id = ws.add(label, 100.0, 100.0).unwrap_or_else(|| panic!("{label} cannot be added"));
        let (saved_kind, saved_model, port_count) = {
            let device = ws.devices.iter().find(|d| d.id == id).expect("added device");
            assert_eq!(&device.kind, kind, "{label}");
            assert_eq!(&device.model, label, "{label}");
            (device.kind.clone(), device.model.clone(), device.ports.len())
        };
        assert!(port_count > 0, "{label} has no ports");

        assert!(ws.set_config(&id, "10.99.0.2", "255.255.255.0", "", "").is_ok(), "{label} takes an address");
        assert!(ws.set_power(&id, false), "{label} powers off");
        assert!(ws.set_power(&id, true), "{label} powers on");

        let back = Workspace::from_tnet(&ws.to_tnet()).unwrap_or_else(|e| panic!("{label} cannot be reloaded: {e:?}"));
        let copy = back.devices.iter().find(|d| d.id == id).unwrap_or_else(|| panic!("{label} vanished"));
        assert_eq!(copy.model, saved_model, "{label}");
        assert_eq!(copy.kind, saved_kind, "{label}");
        assert_eq!(copy.ports.len(), port_count, "{label}");
        assert!(ws.remove(&id), "{label} cannot be removed");
        checked += 1;
    }
    assert!(checked >= 40, "the palette should contain every model, checked {checked}");
}

#[test]
fn printer_and_tv_descriptions_state_what_is_not_modelled() {
    let text = |label: &str| {
        CATALOG
            .iter()
            .find(|(name, _, _)| *name == label)
            .map(|(_, blurb, _)| *blurb)
            .unwrap_or("")
    };
    assert!(text("Printer").contains("Print jobs are not simulated"));
    assert!(text("TV").contains("Streaming apps are not simulated"));
}

#[test]
fn only_the_hub_is_a_fixed_mdi_x_port() {
    for (label, _, kind) in CATALOG {
        let port = crate::workspace::mdi::mdi_port(kind);
        assert_eq!(port.auto, *kind != "hub", "{label}");
        if *kind == "hub" {
            assert_eq!(port.role, crate::workspace::MdiRole::Mdix);
        }
    }
}
