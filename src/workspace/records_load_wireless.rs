use super::*;

impl Workspace {
    pub(super) fn load_iot_wireless_line(&mut self, f: &[&str]) -> Option<()> {
        match f {
            ["iot", dev, addr, value] => {
                if let (Ok(a), Ok(v)) = (addr.parse::<u16>(), value.parse::<u16>()) {
                    let _ = self.iot_write(dev, a, v);
                }
            }
            ["ptp", slave, master, offset] => {
                if let Ok(off) = offset.parse::<f64>() {
                    self.ptp.insert(slave.to_string(), (master.to_string(), off));
                }
            }
            ["prpon", dev] => {
                self.prp_on.insert(dev.to_string());
            }
            ["cell", client, tower] => {
                self.cell_links
                    .insert(client.to_string(), tower.to_string());
            }
            ["wlan", wlc, ssid, psk, security] => {
                let _ = self.wlan_add_with(
                    wlc,
                    &unescape_field(ssid),
                    &unescape_field(psk),
                    security.to_string(),
                );
            }
            ["wlan", wlc, ssid, psk] => {
                let _ = self.wlan_add(wlc, &unescape_field(ssid), &unescape_field(psk));
            }
            ["portfwd", router, outside, target, inside] => {
                if let (Ok(o), Ok(i)) = (outside.parse(), inside.parse()) {
                    let _ = self.add_port_forward(router, o, target, i);
                }
            }
            ["vnet2", dev, vni] => {
                if let Ok(v) = vni.parse() {
                    let _ = self.vnet_join(dev, v);
                }
            }
            ["group", _gid, name, members] => {
                let list: Vec<String> = members.split(',').map(str::to_string).collect();
                let _ = self.collapse(&unescape_field(name), &list);
            }
            ["voucher", dev, code, minutes, used] => {
                if let Ok(m) = minutes.parse() {
                    let _ = self.voucher_create(dev, &unescape_field(code), m);
                    if *used != "-" {
                        let _ = self.voucher_redeem(dev, used, &unescape_field(code));
                    }
                }
            }
            ["demand", client, mbit] => {
                if let Ok(m) = mbit.parse() {
                    let _ = self.set_demand(client, m);
                }
            }
            ["queue", dev, user, mbit] => {
                if let Ok(m) = mbit.parse() {
                    let _ = self.set_queue(dev, user, m);
                }
            }
            ["qparent", dev, mbit] => {
                if let Ok(m) = mbit.parse() {
                    let _ = self.set_queue_parent(dev, m);
                }
            }
            ["tunnel", device, peer, key] => {
                let _ = self.tunnel_config(device, peer, &unescape_field(key));
            }
            ["guestnet", wlc, ssid] => {
                let _ = self.wlan_set_guest(wlc, &unescape_field(ssid), true);
            }
            ["capwap", ap, wlc] => {
                let _ = self.capwap_join(ap, wlc);
            }
            ["wifi", client, ssid, wlc] => {
                self.wifi
                    .insert(client.to_string(), (unescape_field(ssid), wlc.to_string()));
            }
            ["vpn", client, server, user] => {
                self.vpn.insert(
                    client.to_string(),
                    (server.to_string(), unescape_field(user)),
                );
            }
            ["pppoe", client, server, user] => {
                self.pppoe.insert(
                    client.to_string(),
                    (server.to_string(), unescape_field(user)),
                );
            }
            ["phone", phone, cm, ext] => {
                if let Ok(e) = ext.parse::<u16>() {
                    self.phones.insert(phone.to_string(), (cm.to_string(), e));
                }
            }
            _ => {}
        }
        Some(())
    }
}
