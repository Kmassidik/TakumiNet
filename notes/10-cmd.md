# 10 — Command Prompt and the event clock (`cmd.rs`, `sched.rs`)

Status: landed 2026-11-01.

## Why the prompt moved server-side

The old Command Prompt answered `ping` in JavaScript by comparing the first
three octets, and could not cross a router at all. Every command now runs in
Rust against the live workspace, so the endpoint and the simulator cannot
disagree.

`POST /api/cmd?id=pc0&line=…` → `{"output": …}` (plus `"peer"` for telnet).

| Command | Behaviour |
|---|---|
| `ipconfig` | Adapter address, mask, gateway, DNS, physical address from the device |
| `ping HOST` | Real `send_pdu`; 4 replies on success, `Destination host unreachable` when the path is down, `Request timed out` when the address has no owner |
| `tracert HOST` | Walks the delivered hops, skips L2 switches and the sender, prints router ingress addresses then the destination |
| `arp -a` | The device's live ARP cache; routed traffic caches the gateway |
| `nslookup NAME` | Resolver timeout (no DNS server is simulated yet) |
| `netstat` | Local sockets |
| `telnet HOST` | If a router/switch answers, the prompt continues inside that CLI (`Router0>`, `Router0#`, …); `exit` leaves the session |

## The clock

`sched::Scheduler` is a min-heap of arrivals. `deliver` schedules one arrival
per path device at `now + hop·1 ms`, stamps each `Hop::t`, and returns the last
timestamp as `Delivery::finished_at`; `send_pdu` sets the workspace clock to it.

```
event t 0.005
  PC0      0.001
  Switch0  0.002   flooding (unknown 00d0.ba0a.46dc)
  Router0  0.003   routed: TTL 128 -> 127
  Switch1  0.004
  PC2      0.005
```

Two deliveries scheduled at 0.0 and 0.0005 interleave (`a x b y c`), which the
scheduler unit test asserts.

## Verified in Chromium

`PC0 → Desktop → Command Prompt`:

```
C:\> ipconfig
   IPv4 Address....................: 192.168.1.10
   Default Gateway.................: 192.168.1.1
C:\> tracert 192.168.2.10
  1    1 ms    1 ms    1 ms  192.168.1.1
  2    1 ms    1 ms    1 ms  192.168.2.10
C:\> telnet 192.168.1.1
Trying 192.168.1.1 ...Open
Router0>en
Router0#show ip int br
GigabitEthernet0/2     unassigned      YES  unset  notconnect            down
```

The dead JavaScript `runCommand` implementation was removed with an AST
rewrite rather than left beside the live path.
