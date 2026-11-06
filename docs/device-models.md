# Device model capabilities

The palette shares one IPv4 host stack across many endpoint models. A model is
not a separate protocol stack; the differences are the ports, apps and special
functions below.

| Model family | IPv4 host | Wi-Fi | Special function |
|---|---|---|---|
| PC, Laptop, Tablet | yes | Laptop, Tablet | browser, terminal |
| TV | yes | yes | browser; streaming is not simulated |
| Printer | yes | no | address only; print jobs are not simulated |
| IP Phone | yes | yes | VoIP registration and calls |
| Server | yes | no | web, DNS, DHCP, mail, files |
| Sniffer | yes | no | captures frames on a tapped cable |
| AP, WLC, Hotspot AP | management address | radio side | CAPWAP, SSID, vouchers |
| Analog Phone | no | no | needs a voice port on a router or switch |
| Router, Switch, L3 Switch | routing/switching | no | CLI, VLANs, ACLs, NAT, OSPF |
| PLC, Thing, IoE | yes | no | Modbus-style registers |
| Hub | repeater only | no | collisions, no MAC table |

## What is tested

- every palette model: add, power cycle, address, save, reload, remove;
- cable media and Auto-MDI-X rules;
- routing, DHCP, DNS, NAT, ACL, firewall, wireless, VoIP and IoT functions in
  their own suites.

Not tested as a separate function, because it is not modelled:

- printer jobs and printer discovery;
- TV streaming and media apps;
- game consoles and other uncatalogued models.

Those omissions are stated here and in the palette description rather than
implied by an icon.
