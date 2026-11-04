use super::*;

#[derive(Clone, Debug, PartialEq)]
pub struct LinkLoad {
    pub a: String,
    pub a_port: String,
    pub b: String,
    pub b_port: String,
    pub mbit: f64,
    pub capacity_mbit: f64,
    pub percent: f64,
}

impl Workspace {
    /// A steady flow for the flow view, in Mbit/s. Zero removes it.
    pub fn flow_set(&mut self, from: &str, to: &str, mbit: u32) -> Result<(), String> {
        for id in [from, to] {
            if !self.devices.iter().any(|d| d.id == id) {
                return Err(format!("unknown device {id}"));
            }
        }
        if from == to {
            return Err("a flow needs two different ends".into());
        }
        if mbit > 100_000 {
            return Err("a flow must be at most 100000 Mbit/s".into());
        }
        self.flows.retain(|(a, b, _)| !(a == from && b == to));
        if mbit > 0 {
            self.flows.push((from.to_string(), to.to_string(), mbit));
            self.flows.sort();
        }
        Ok(())
    }

    /// Per-flow cable paths. With spread on, a flow that has a second live path
    /// around its first cable is split evenly over both.
    fn flow_paths(&self) -> Vec<(Vec<usize>, f64)> {
        let mut out = Vec::new();
        for (from, to, mbit) in &self.flows {
            let Some(path) = self.flow_route(from, to, None) else { continue };
            if self.flow_spread {
                let other = path.iter().find_map(|skip| {
                    self.flow_route(from, to, Some(*skip)).filter(|p| *p != path)
                });
                if let Some(other) = other {
                    out.push((path, *mbit as f64 / 2.0));
                    out.push((other, *mbit as f64 / 2.0));
                    continue;
                }
            }
            out.push((path, *mbit as f64));
        }
        out
    }

    fn flow_route(&self, from: &str, to: &str, without_link: Option<usize>) -> Option<Vec<usize>> {
        let src = self.devices.iter().find(|d| d.id == from)?;
        let dst = self.devices.iter().find(|d| d.id == to)?;
        let target = dst.ip.or_else(|| dst.ports.iter().find_map(|p| p.ip))?;
        match without_link {
            None => crate::net::fwd::routed_path(self, src, dst, target).ok().map(|p| p.links),
            Some(skip) => {
                let mut copy = self.clone();
                let link = copy.links.get(skip)?.clone();
                let full = copy.devices.iter().find(|d| d.id == link.a).and_then(|d| {
                    let names: Vec<String> = d.ports.iter().map(|p| p.name.clone()).collect();
                    crate::cli::expand_iface(&link.a_port, &names)
                })?;
                copy.set_port_up(&link.a, &full, false);
                let hops = crate::net::fwd::routed_path(&copy, src, dst, target).ok()?.links;
                (!hops.contains(&skip)).then_some(hops)
            }
        }
    }

    /// The load every cable carries, from the flow table.
    pub fn link_loads(&self) -> Vec<LinkLoad> {
        let mut carried: HashMap<usize, f64> = HashMap::new();
        for (links, mbit) in self.flow_paths() {
            for index in links {
                *carried.entry(index).or_insert(0.0) += mbit;
            }
        }
        let port_speed = |id: &str, raw: &str| {
            self.devices.iter().find(|d| d.id == id).and_then(|d| {
                let names: Vec<String> = d.ports.iter().map(|p| p.name.clone()).collect();
                let full = crate::cli::expand_iface(raw, &names)?;
                d.ports.iter().find(|p| p.name == full).map(|p| p.bandwidth_kbps)
            }).unwrap_or(100_000)
        };
        let mut out: Vec<LinkLoad> = self.links.iter().enumerate().map(|(index, link)| {
            let mbit = carried.get(&index).copied().unwrap_or(0.0);
            let capacity = port_speed(&link.a, &link.a_port).min(port_speed(&link.b, &link.b_port)) as f64 / 1000.0;
            LinkLoad {
                a: self.name_of(&link.a), a_port: link.a_port.clone(),
                b: self.name_of(&link.b), b_port: link.b_port.clone(),
                mbit, capacity_mbit: capacity,
                percent: if capacity > 0.0 { mbit / capacity * 100.0 } else { 0.0 },
            }
        }).collect();
        out.sort_by(|x, y| y.percent.total_cmp(&x.percent));
        out
    }

    pub fn set_flow_spread(&mut self, on: bool) {
        self.flow_spread = on;
    }

    pub(super) fn hottest_link_percent(&self) -> f64 {
        self.link_loads().first().map_or(0.0, |l| l.percent)
    }

    pub fn flow_rows(&self) -> Vec<(String, String, u32)> {
        self.flows.clone()
    }
}
