pub mod fwd;
pub mod packet;
pub mod sched;
pub mod sim;

#[path = "fwd/duplex.rs"]
pub(crate) mod duplex;

#[path = "fwd/v6.rs"]
pub(crate) mod v6;
