use std::collections::HashMap;

use super::Mac;

/// One learned (MAC, port) binding.
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct MacEntry {
    pub mac: Mac,
    pub port: usize,
    pub learned_at: f64,
    pub static_entry: bool,
}

/// A switch's forwarding table.
#[derive(Clone, Debug, Default)]
pub struct MacTable {
    entries: HashMap<Mac, MacEntry>,
    aging: f64,
}

impl MacTable {
    pub fn new(aging: f64) -> MacTable {
        MacTable {
            entries: HashMap::new(),
            aging,
        }
    }

    /// Learn on ingress only when the frame is not from the interface's own MAC.
    pub fn learn(&mut self, mac: Mac, port: usize, now: f64) {
        if mac.is_multicast() {
            return;
        }
        match self.entries.get_mut(&mac) {
            Some(e) => {
                e.port = port;
                e.learned_at = now;
            }
            None => {
                self.entries.insert(
                    mac,
                    MacEntry {
                        mac,
                        port,
                        learned_at: now,
                        static_entry: false,
                    },
                );
            }
        }
    }

    pub fn lookup(&self, mac: Mac, now: f64) -> Option<MacEntry> {
        let e = *self.entries.get(&mac)?;
        if !e.static_entry && now - e.learned_at > self.aging {
            return None;
        }
        Some(e)
    }

    /// Broadcast, multicast and unknown unicast flood every port but ingress.
    pub fn flood(&self, ingress: usize, ports: usize) -> Vec<usize> {
        (0..ports).filter(|p| *p != ingress).collect()
    }

    /// Drop bindings older than the ageing time.
    pub fn age(&mut self, now: f64) -> usize {
        let cutoff = now - self.aging;
        let before = self.entries.len();
        self.entries
            .retain(|_, e| e.static_entry || e.learned_at > cutoff);
        before - self.entries.len()
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    /// `show mac address-table` rows, ordered by port then MAC.
    pub fn rows(&self) -> Vec<MacEntry> {
        let mut out: Vec<MacEntry> = self.entries.values().copied().collect();
        out.sort_by_key(|e| (e.port, e.mac));
        out
    }
}

/// A resolved (IPv4, MAC) pair with an expiry.
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct ArpEntry {
    pub ip: u32,
    pub mac: Mac,
    pub learned_at: f64,
}

/// An ARP cache. Unresolved traffic is dropped by the caller, which then emits
/// the ARP request — the same ordering a real host does.
#[derive(Clone, Debug, Default)]
pub struct ArpTable {
    entries: HashMap<u32, ArpEntry>,
    timeout: f64,
}

impl ArpTable {
    pub fn new(timeout: f64) -> ArpTable {
        ArpTable {
            entries: HashMap::new(),
            timeout,
        }
    }

    pub fn insert(&mut self, ip: u32, mac: Mac, now: f64) {
        self.entries.insert(
            ip,
            ArpEntry {
                ip,
                mac,
                learned_at: now,
            },
        );
    }

    pub fn lookup(&self, ip: u32, now: f64) -> Option<Mac> {
        let e = self.entries.get(&ip)?;
        if now - e.learned_at > self.timeout {
            return None;
        }
        Some(e.mac)
    }

    pub fn expire(&mut self, now: f64) -> usize {
        let cutoff = now - self.timeout;
        let before = self.entries.len();
        self.entries.retain(|_, e| e.learned_at > cutoff);
        before - self.entries.len()
    }

    /// `show arp` rows, ordered by address.
    pub fn rows(&self) -> Vec<ArpEntry> {
        let mut out: Vec<ArpEntry> = self.entries.values().copied().collect();
        out.sort_by_key(|e| e.ip);
        out
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mac_table_learns_ages_and_floods() {
        let mut t = MacTable::new(300.0);
        let a = Mac::for_device("pc0");
        t.learn(a, 1, 10.0);
        assert_eq!(t.lookup(a, 10.5).map(|e| e.port), Some(1));
        assert_eq!(t.lookup(a, 311.0), None, "aged out");
        t.learn(a, 2, 20.0);
        assert_eq!(t.lookup(a, 21.0).map(|e| e.port), Some(2), "relearned port");
        t.learn(Mac::BROADCAST, 3, 20.0);
        assert_eq!(t.len(), 1, "multicast is never learned");
        assert_eq!(t.flood(1, 4), vec![0, 2, 3]);
        assert_eq!(t.age(400.0), 1);
        assert!(t.is_empty());
    }

    #[test]
    fn arp_cache_expires() {
        let mut c = ArpTable::new(120.0);
        let ip = 0xc0a80101;
        c.insert(ip, Mac::for_device("pc1"), 5.0);
        assert_eq!(c.lookup(ip, 100.0), Some(Mac::for_device("pc1")));
        assert_eq!(c.lookup(ip, 126.0), None);
        assert_eq!(c.expire(200.0), 1);
        assert!(c.is_empty());
    }
}
