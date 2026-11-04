use super::super::*;

const FACTORY: &str = include_str!("../../../web/templates/tpl-factory-floor.xml");
const SENSOR_LESSON: &str = include_str!("../../../web/templates/les-l3-07-read-the-sensor.xml");
const CELL_LESSON: &str = include_str!("../../../web/templates/les-l8-04-when-the-fibre-dies.xml");
const CELL_TEMPLATE: &str = include_str!("../../../web/templates/tpl-cell-backup.xml");

fn results(ws: &mut Workspace) -> Vec<(String, bool, String)> {
    ws.run_checks().into_iter().map(|r| (r.id, r.passed, r.actual)).collect()
}

#[test]
fn the_factory_floor_opens_clean_and_carries_modbus_end_to_end() {
    let mut ws = Workspace::from_tnet(FACTORY).unwrap();
    assert!(ws.load_problems.is_empty(), "{:?}", ws.load_problems);
    assert_eq!(ws.iot_read("thing0", 2).unwrap(), 73, "the sensor ships with a temperature");
    ws.send_addressed_pdu("pc0", "plc0").unwrap();
    assert_eq!(ws.send_iot("plc0", "thing0", "modbus", 0).unwrap(), "MODBUS delivered");
    assert_eq!(ws.iot_write("plc0", 1, 1).unwrap(), 0);
    assert_eq!(ws.iot_read("plc0", 1).unwrap(), 1);
    let saved = ws.to_tnet();
    let mut back = Workspace::from_tnet(&saved).unwrap();
    assert_eq!(back.iot_read("plc0", 1).unwrap(), 1, "registers survive save and open");
}

#[test]
fn the_sensor_lesson_passes_only_after_both_registers_are_written() {
    let mut ws = Workspace::from_tnet(SENSOR_LESSON).unwrap();
    assert!(ws.load_problems.is_empty(), "{:?}", ws.load_problems);
    let first = results(&mut ws);
    assert!(first.iter().find(|(id, _, _)| id == "c1").unwrap().1, "the floor network is already up");
    assert!(!first.iter().find(|(id, _, _)| id == "c2").unwrap().1);
    assert!(!first.iter().find(|(id, _, _)| id == "c3").unwrap().1);

    let temperature = ws.iot_read("thing0", 2).unwrap();
    ws.iot_write("plc0", 2, temperature).unwrap();
    ws.iot_write("plc0", 1, 1).unwrap();
    let done = results(&mut ws);
    assert!(done.iter().all(|(_, passed, _)| *passed), "{done:?}");
    assert!(done.iter().any(|(_, _, actual)| actual == "register 2 holds 73"), "{done:?}");
}

#[test]
fn the_iot_check_reports_bad_registers_and_wrong_devices_plainly() {
    let mut ws = Workspace::from_tnet(SENSOR_LESSON).unwrap();
    let verdict = ws.run_extra_check(&Check {
        id: "x".into(), kind: "iot".into(), from: "switch0".into(),
        to: "1".into(), url: String::new(), expect: "1".into(), label: String::new(),
    }).unwrap();
    assert!(!verdict.0);
    assert_eq!(verdict.1, "FloorSwitch has no Modbus registers");

    let broken = SENSOR_LESSON.replace("to=\"2\" url=\"\" expect=\"73\"", "to=\"900\" url=\"\" expect=\"73\"");
    let Err(problems) = Workspace::from_tnet(&broken) else {
        panic!("a register outside 0-255 must be rejected");
    };
    assert!(problems.iter().any(|p| p.to_string().contains("register number from 0 to 255")), "{problems:?}");
}

#[test]
fn the_cell_lesson_walks_from_no_path_to_a_message_over_the_tower() {
    let mut ws = Workspace::from_tnet(CELL_LESSON).unwrap();
    assert!(ws.load_problems.is_empty(), "{:?}", ws.load_problems);
    let first = results(&mut ws);
    assert!(first.iter().find(|(id, _, _)| id == "c1").unwrap().1, "the sites start apart: {first:?}");
    assert!(first.iter().filter(|(id, _, _)| id != "c1").all(|(_, passed, _)| !passed));
    assert!(first.iter().any(|(_, _, actual)| actual == "not joined to any tower"));

    ws.cell_join("ioe0", "tower0").unwrap();
    let half = results(&mut ws);
    assert!(half.iter().find(|(id, _, _)| id == "c2").unwrap().1);
    assert!(!half.iter().find(|(id, _, _)| id == "c3").unwrap().1);

    ws.cell_join("ioe1", "tower0").unwrap();
    assert_eq!(ws.send_iot("ioe0", "ioe1", "cellular", 0).unwrap(), "Cellular delivered");
    let done = results(&mut ws);
    assert!(done.iter().all(|(_, passed, _)| *passed), "{done:?}");
}

#[test]
fn the_cell_check_names_the_wrong_tower_and_the_backup_template_ships_joined() {
    let mut ws = Workspace::from_tnet(CELL_TEMPLATE).unwrap();
    assert!(ws.load_problems.is_empty(), "{:?}", ws.load_problems);
    assert_eq!(ws.cell_status("ioe0").as_deref(), Some("tower0"));
    assert_eq!(ws.cell_status("ioe1").as_deref(), Some("tower0"));
    assert_eq!(ws.send_iot("ioe0", "ioe1", "cellular", 0).unwrap(), "Cellular delivered");

    let verdict = ws.run_extra_check(&Check {
        id: "x".into(), kind: "cell".into(), from: "ioe0".into(),
        to: "switch0".into(), url: String::new(), expect: String::new(), label: String::new(),
    }).unwrap();
    assert!(!verdict.0);
    assert_eq!(verdict.1, "joined to RegencyTower, not ClinicSwitch");
}
