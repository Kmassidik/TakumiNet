use super::*;

impl Workspace {
    /// Configure an interface address. `ip` is dotted-quad text.
    pub fn set_ip(&mut self, id: &str, ip: &str, prefix: u8) -> Result<(), String> {
        let parsed = crate::model::parse_ipv4(ip.trim())
            .ok_or_else(|| format!("invalid IPv4 address: {ip}"))?;
        if prefix > 32 {
            return Err("prefix must be between 0 and 32".into());
        }
        let leased_ip = if self.dhcp_clients.contains(id) {
            self.devices.iter().find(|d| d.id == id).and_then(|d| d.ip)
        } else {
            None
        };
        let res = match self.devices.iter_mut().find(|d| d.id == id) {
            Some(d) => {
                d.ip = Some(parsed);
                d.prefix = prefix;
                Ok(())
            }
            None => Err("no such device".into()),
        };
        if res.is_ok() {
            self.remove_dhcp_lease(id, leased_ip);
        }
        res
    }

    /// Full static configuration, matching the fields of a typical
    /// Desktop → IP Configuration utility.
    pub fn set_config(
        &mut self,
        id: &str,
        ip: &str,
        mask: &str,
        gateway: &str,
        dns: &str,
    ) -> Result<(), String> {
        let addr = crate::model::parse_ipv4(ip.trim())
            .ok_or_else(|| format!("invalid IP address: {ip}"))?;
        let prefix = crate::model::parse_mask(mask.trim())
            .ok_or_else(|| format!("invalid subnet mask: {mask}"))?;
        let gw = if gateway.trim().is_empty() {
            None
        } else {
            Some(
                crate::model::parse_ipv4(gateway.trim())
                    .ok_or_else(|| format!("invalid default gateway: {gateway}"))?,
            )
        };
        let dns_ip = if dns.trim().is_empty() {
            None
        } else {
            Some(
                crate::model::parse_ipv4(dns.trim())
                    .ok_or_else(|| format!("invalid DNS server: {dns}"))?,
            )
        };
        let leased_ip = if self.dhcp_clients.contains(id) {
            self.devices.iter().find(|d| d.id == id).and_then(|d| d.ip)
        } else {
            None
        };
        let res = match self.devices.iter_mut().find(|d| d.id == id) {
            Some(d) => {
                d.ip = Some(addr);
                d.prefix = prefix;
                d.gateway = gw;
                d.dns = dns_ip;
                Ok(())
            }
            None => Err("no such device".into()),
        };
        if res.is_ok() {
            self.remove_dhcp_lease(id, leased_ip);
        }
        res
    }

    /// CLI: set an interface address.
    pub fn set_port_ip(&mut self, id: &str, iface: &str, addr: &str, prefix: u8) -> Result<(), String> {
        let ip = crate::model::parse_ipv4(addr.trim())
            .ok_or_else(|| format!("invalid address: {addr}"))?;
        let dev = self
            .devices
            .iter_mut()
            .find(|d| d.id == id)
            .ok_or_else(|| "no such device".to_string())?;
        let port = dev
            .ports
            .iter_mut()
            .find(|p| p.name == iface)
            .ok_or_else(|| format!("no such interface: {iface}"))?;
        port.ip = Some(ip);
        port.prefix = prefix;
        self.recompute_routing();
        Ok(())
    }

    pub fn set_port_bandwidth(&mut self, id: &str, iface: &str, kbps: u32) -> Result<(), String> {
        if kbps == 0 {
            return Err("bandwidth must be greater than zero".into());
        }
        let dev = self
            .devices
            .iter_mut()
            .find(|d| d.id == id)
            .ok_or_else(|| "no such device".to_string())?;
        let port = dev
            .ports
            .iter_mut()
            .find(|p| p.name == iface)
            .ok_or_else(|| format!("no such interface: {iface}"))?;
        port.bandwidth_kbps = kbps;
        self.recompute_routing();
        Ok(())
    }

    pub fn set_port_delay(&mut self, id: &str, iface: &str, usec: u32) -> Result<(), String> {
        let dev = self
            .devices
            .iter_mut()
            .find(|d| d.id == id)
            .ok_or_else(|| "no such device".to_string())?;
        let port = dev
            .ports
            .iter_mut()
            .find(|p| p.name == iface)
            .ok_or_else(|| format!("no such interface: {iface}"))?;
        port.delay_us = usec;
        self.recompute_routing();
        Ok(())
    }

    /// CLI: administratively enable/disable an interface.
    pub fn set_port_up(&mut self, id: &str, iface: &str, up: bool) -> bool {
        let Some(dev) = self.devices.iter_mut().find(|d| d.id == id) else {
            return false;
        };
        let changed = match dev.ports.iter_mut().find(|p| p.name == iface) {
            Some(p) => {
                p.up = up;
                true
            }
            None => false,
        };
        if changed {
            self.recompute_routing();
        }
        changed
    }
}
