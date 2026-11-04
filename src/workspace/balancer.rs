use super::*;

impl Workspace {
    pub fn lb_add_member(&mut self, balancer: &str, member: &str) -> Result<(), String> {
        if !self.devices.iter().any(|d| d.id == balancer && d.kind == "load-balancer") {
            return Err("pools live on a load balancer".into());
        }
        if !self.devices.iter().any(|d| d.id == member && d.kind == "server") {
            return Err("a pool member must be a server".into());
        }
        let pool = self.lb_pools.entry(balancer.to_string()).or_default();
        if pool.iter().any(|id| id == member) {
            return Err(format!("{member} is already in the pool"));
        }
        pool.push(member.to_string());
        Ok(())
    }

    pub fn lb_remove_member(&mut self, balancer: &str, member: &str) -> bool {
        let Some(pool) = self.lb_pools.get_mut(balancer) else { return false };
        let before = pool.len();
        pool.retain(|id| id != member);
        pool.len() != before
    }

    /// Round robin over the healthy members: a member is healthy while a path
    /// from the balancer reaches it.
    pub fn lb_pick(&mut self, balancer: &str) -> Result<String, String> {
        let pool = self.lb_pools.get(balancer).cloned().unwrap_or_default();
        if pool.is_empty() {
            return Err("the pool is empty: add servers to the balancer".into());
        }
        let start = *self.lb_next.get(balancer).unwrap_or(&0);
        for offset in 0..pool.len() {
            let member = &pool[(start + offset) % pool.len()];
            if crate::net::fwd::reachable(self, balancer, member) {
                self.lb_next.insert(balancer.to_string(), (start + offset + 1) % pool.len());
                *self.lb_hits.entry(balancer.to_string()).or_default().entry(member.clone()).or_insert(0) += 1;
                return Ok(member.clone());
            }
        }
        Err("no healthy server is left in the pool".into())
    }

    pub fn lb_rows(&self, balancer: &str) -> Vec<(String, u32)> {
        self.lb_pools.get(balancer).into_iter().flatten()
            .map(|id| (id.clone(), self.lb_hits.get(balancer).and_then(|h| h.get(id)).copied().unwrap_or(0)))
            .collect()
    }

    pub(super) fn lb_served_count(&self, balancer: &str) -> usize {
        self.lb_rows(balancer).iter().filter(|(_, hits)| *hits > 0).count()
    }
}
