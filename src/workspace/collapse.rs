use super::*;

#[derive(Clone, Debug, PartialEq)]
pub struct NodeCard {
    pub name: String,
    pub devices: usize,
    pub kinds: Vec<(String, usize)>,
    pub capacity_mbit: f64,
    pub delay_ms: f64,
    pub boundary_links: usize,
    pub status: &'static str,
}

impl Workspace {
    /// Fold a set of devices into one named node. The devices and their state
    /// stay untouched underneath, so expanding is lossless.
    pub fn collapse(&mut self, name: &str, members: &[String]) -> Result<String, String> {
        let name = name.trim();
        if name.is_empty() {
            return Err("a group needs a name".into());
        }
        if members.len() < 2 {
            return Err("a group needs at least two devices".into());
        }
        for id in members {
            if !self.devices.iter().any(|d| &d.id == id) {
                return Err(format!("unknown device {id}"));
            }
            if let Some((group, _)) = self.groups.iter().find(|(_, list)| list.1.contains(id)) {
                return Err(format!("{id} is already inside {group}"));
            }
        }
        let number = (0..).find(|n| !self.groups.contains_key(&format!("group{n}"))).unwrap_or(0);
        let id = format!("group{number}");
        let mut sorted = members.to_vec();
        sorted.sort();
        sorted.dedup();
        if sorted.len() != members.len() {
            return Err("a device appears twice in the group".into());
        }
        self.groups.insert(id.clone(), (name.to_string(), sorted));
        Ok(id)
    }

    /// Unfold a group. The inner network reappears exactly as it was.
    pub fn expand(&mut self, group: &str) -> bool {
        self.groups.remove(group).is_some()
    }

    /// The links that cross the group boundary: the group's uplinks.
    fn boundary(&self, members: &[String]) -> Vec<&Link> {
        self.links.iter().filter(|l| {
            members.contains(&l.a) != members.contains(&l.b)
        }).collect()
    }

    /// The card a collapsed node shows, computed from live state, never typed.
    pub fn node_card(&self, group: &str) -> Option<NodeCard> {
        let (name, members) = self.groups.get(group)?;
        let mut kinds: HashMap<String, usize> = HashMap::new();
        for id in members {
            if let Some(d) = self.devices.iter().find(|d| &d.id == id) {
                *kinds.entry(d.kind.clone()).or_insert(0) += 1;
            }
        }
        let mut kinds: Vec<(String, usize)> = kinds.into_iter().collect();
        kinds.sort();
        let port_of = |id: &str, raw: &str| {
            self.devices.iter().find(|d| d.id == id).and_then(|d| {
                let names: Vec<String> = d.ports.iter().map(|p| p.name.clone()).collect();
                let full = crate::cli::expand_iface(raw, &names)?;
                d.ports.iter().find(|p| p.name == full).cloned()
            })
        };
        let boundary = self.boundary(members);
        let mut capacity = f64::INFINITY;
        let mut delay_us: u64 = 0;
        let mut any_down = false;
        for link in &boundary {
            let ends = [port_of(&link.a, &link.a_port), port_of(&link.b, &link.b_port)];
            let slowest = ends.iter().flatten().map(|p| p.bandwidth_kbps).min().unwrap_or(100_000);
            capacity = capacity.min(slowest as f64 / 1000.0);
            delay_us = delay_us.max(ends.iter().flatten().map(|p| p.delay_us as u64).max().unwrap_or(100));
            if ends.iter().flatten().any(|p| !p.up) {
                any_down = true;
            }
        }
        let inner_down = members.iter().any(|id| {
            self.devices.iter().find(|d| &d.id == id).is_some_and(|d| d.ports.iter().any(|p| !p.up))
        });
        let status = if boundary.is_empty() {
            "isolated"
        } else if any_down {
            "down"
        } else if inner_down {
            "degraded"
        } else {
            "up"
        };
        Some(NodeCard {
            name: name.clone(),
            devices: members.len(),
            kinds,
            capacity_mbit: if capacity.is_finite() { capacity } else { 0.0 },
            delay_ms: delay_us as f64 / 1000.0,
            boundary_links: boundary.len(),
            status,
        })
    }

    pub fn group_rows(&self) -> Vec<(String, String, Vec<String>)> {
        let mut out: Vec<(String, String, Vec<String>)> = self.groups.iter()
            .map(|(id, (name, members))| (id.clone(), name.clone(), members.clone()))
            .collect();
        out.sort();
        out
    }
}
