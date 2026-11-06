//! Which destination MAC a frame carries on each L2 leg.
//!
//! The decision comes from the ARP cache of the most recent L3 device, not from
//! a shortcut lookup of the destination device; an ARP entry poisoned or aged
//! out at the sender really changes or drops the frame.

use super::*;

pub(super) fn frame_mac(ws: &mut Workspace, path: &[String], i: usize, dip: u32) -> Mac {
    let last = path.len() - 1;
    let upto = i.min(last.saturating_sub(1));
    let source = (0..=upto)
        .rev()
        .find(|k| {
            ws.devices
                .iter()
                .find(|d| d.id == path[*k])
                .is_some_and(|d| crate::model::routes_packets(&d.kind))
        })
        .unwrap_or(0);
    let (id, target_ip, next_l3) = {
        let Some(dev) = ws.devices.iter().find(|d| d.id == path[source]) else {
            return Mac::for_device(&path[last]);
        };
        let target_ip = match next_hop(ws, dev, dip) {
            NextHop::Direct(_) => dip,
            NextHop::Via(ip, _) => ip,
            NextHop::NoRoute(_) => 0,
        };
        let next_l3 = next_l3_id(ws, path, source, &path[last]);
        (dev.id.clone(), target_ip, next_l3)
    };
    ws.tables
        .arps(&id)
        .lookup(target_ip, f64::from(ws.sim_time))
        .unwrap_or_else(|| Mac::for_device(&next_l3))
}
