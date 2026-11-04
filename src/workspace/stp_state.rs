use super::*;
use crate::net::packet::Mac;

impl Workspace {
    /// The switch whose bridge id won the election in this device's segment.
    pub fn stp_root_of(&self, device: &str) -> Option<String> {
        let root = *self.stp_topology().roots.get(device)?;
        self.devices.iter()
            .find(|d| crate::net::packet::Mac::for_device(&d.id) == root.mac)
            .map(|d| d.id.clone())
    }

    /// Ports the spanning tree blocks, as (device id, full port name).
    pub fn stp_blocked_ports(&self) -> Vec<(String, String)> {
        self.stp_topology().blocked
    }

    /// Root id plus this switch's root and blocked ports from one STP pass.
    pub fn stp_device_state(&self, device: &str) -> (u32, Mac, Vec<String>, Vec<String>) {
        let topology = self.stp_topology();
        let id = topology.roots.get(device).copied().unwrap_or_else(|| self.bridge_id(device, 1));
        let root_ports = topology
            .root_ports
            .into_iter()
            .filter_map(|(id, port)| (id == device).then_some(port))
            .collect();
        let blocked = topology
            .blocked
            .into_iter()
            .filter_map(|(id, port)| (id == device).then_some(port))
            .collect();
        (id.priority, id.mac, root_ports, blocked)
    }
}
