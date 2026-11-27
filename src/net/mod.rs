pub mod fwd;
pub mod packet;
pub mod sched;
pub mod sim;
pub mod vxlan;

#[path = "fwd/duplex.rs"]
pub(crate) mod duplex;

#[path = "fwd/v6.rs"]
pub(crate) mod v6;
