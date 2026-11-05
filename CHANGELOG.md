# Changelog

## 0.2.0

### New device features

- Speed and duplex negotiation, with a mismatch that drops frames and counts errors.
- PortFast, BPDU guard, errdisable and storm control on access ports.
- PoE budgeting on switches, with plain denial reasons.
- LLDP neighbours (`show lldp neighbors`).
- A host firewall (`ufw`) in the terminal, IPv4 and same-segment IPv6 echo.
- DHCP snooping, dynamic ARP inspection and duplicate-address warnings.
- VRRP virtual gateways with failover by owner election.
- Wi-Fi channel and band settings with a 2.4 GHz overlap warning.
- Hub CSMA/CD collisions in Play and in stepped hand-sent traffic.
- Port mirroring into the Sniffer (`monitor session`).
- Replace a device in place from the context menu, keeping its name and cables.

### New lessons

- Slow link, LLDP discovery, server lockdown with `ufw`, the noisy hub, two
  competing Wi-Fi networks, a rogue switch, a rogue DHCP server and a failing
  gateway.
- A mirroring lesson ("Watch the wire") and a lesson on one shared wire.
- 73 guided lessons and 35 ready-to-run example networks in total.

### Fixes

- Replace now says what it will clear before the swap and in the status line.
- The send queue is visible next to Step and says when a reload cleared it.
- The small-screen page explains how to open the app on a wider screen.
- Duplicate addresses are reported in the dialog, the window and the CLI.
- Lesson identities and README counts match the shipped templates.

### Not simulated

Real 802.1X exchanges, IPv6 routing and NDP, VRRP timers and authentication,
ARP-table forwarding, Wi-Fi signal strength and roaming, and vendor names from
MAC addresses. IEEE and Cisco names are used plainly; this is not a claim of
certification.
