import { expect, test } from "bun:test";
import { OTHER_GROUP, PROTOCOL_GROUPS, groupProtocols } from "../../web/ts/ui/protocol_groups";

const serverFilters = ["ACL", "AAA", "AEP", "BGP", "BT", "DHCP", "DHCPv6", "DNS", "EIGRP", "E-mail", "FTP", "H.323", "HTTP", "HTTPS", "ICMP", "ICMPv6", "IEEE802.1X", "IPSEC", "ISAKMP", "IS-IS", "LACP", "LISP", "MODBUS", "MQTT", "NAC", "NDP", "NETCONF", "NTP", "OSPF", "PAgP", "PAP", "POP3", "PPP", "PROFINET", "PRP", "PTP", "RADIUS", "RIP", "RTP", "SCCP", "SCTP", "SIP", "SMTP", "SNMP", "SSH", "STP", "SYSLOG", "TACACS", "TCP", "TFTP", "Telnet", "UDP", "VTP", "Cellular"];

test("every protocol the server lists lands in exactly one group, none in Other", () => {
  const groups = groupProtocols(serverFilters);
  const all = groups.flatMap((g) => g.labels);
  expect(all.sort()).toEqual([...serverFilters].sort());
  expect(new Set(all).size).toBe(all.length);
  expect(groups.find((g) => g.name === OTHER_GROUP)).toBeUndefined();
});

test("the long list is split into short groups", () => {
  const groups = groupProtocols(serverFilters);
  expect(groups.length).toBeGreaterThanOrEqual(6);
  for (const g of groups) expect(g.labels.length).toBeLessThanOrEqual(16);
});

test("an unknown protocol goes to Other, duplicates are dropped, empty groups are left out", () => {
  const groups = groupProtocols(["TCP", "TCP", "FOO"]);
  expect(groups).toEqual([
    { name: "Transport", labels: ["TCP"] },
    { name: OTHER_GROUP, labels: ["FOO"] },
  ]);
  expect(groupProtocols([])).toEqual([]);
});

test("no protocol is listed in two groups", () => {
  const seen = new Set<string>();
  for (const [, members] of PROTOCOL_GROUPS) {
    for (const m of members) {
      expect(seen.has(m), m).toBe(false);
      seen.add(m);
    }
  }
});
