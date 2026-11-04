/* The event filter list is about 50 protocols. Grouping them by layer keeps the
   list short: each group opens on demand. Unknown protocols fall into Other. */

export const PROTOCOL_GROUPS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ["Link", ["ARP", "LACP", "PAgP", "STP", "VTP", "PPP", "PAP", "PRP", "IEEE802.1X", "CDP", "LLDP"]],
  ["Network", ["ICMP", "ICMPv6", "NDP", "IPSEC", "ISAKMP", "OSPF", "EIGRP", "RIP", "BGP", "IS-IS", "LISP"]],
  ["Transport", ["TCP", "UDP", "SCTP"]],
  ["Application", ["DHCP", "DHCPv6", "DNS", "HTTP", "HTTPS", "E-mail", "SMTP", "POP3", "FTP", "TFTP", "Telnet", "SSH", "NTP", "SNMP", "SYSLOG", "NETCONF"]],
  ["Voice and media", ["SIP", "RTP", "SCCP", "H.323"]],
  ["Access and security", ["ACL", "AAA", "RADIUS", "TACACS", "NAC"]],
  ["Industrial and IoT", ["MODBUS", "MQTT", "PROFINET", "PTP", "BT", "AEP", "Cellular"]],
];

export const OTHER_GROUP = "Other";

export interface ProtocolGroup {
  name: string;
  labels: string[];
}

/* Every label lands in exactly one group, in the order the groups are listed.
   Groups with no labels are left out. */
export function groupProtocols(labels: readonly string[]): ProtocolGroup[] {
  const seen = [...new Set(labels)];
  const groups: ProtocolGroup[] = PROTOCOL_GROUPS.map(([name, members]) => ({
    name,
    labels: seen.filter((label) => members.includes(label)),
  }));
  const known = new Set(PROTOCOL_GROUPS.flatMap(([, members]) => members));
  groups.push({ name: OTHER_GROUP, labels: seen.filter((label) => !known.has(label)) });
  return groups.filter((group) => group.labels.length > 0);
}
