//! The command table: one place that names every command the terminal knows,
//! so `help` and `COMMAND --help` can never drift from what really runs.

pub(super) struct Entry {
    pub name: &'static str,
    pub group: &'static str,
    pub usage: &'static str,
    pub summary: &'static str,
    pub notes: &'static str,
}

pub(super) const COMMANDS: &[Entry] = &[
    Entry { name: "ip", group: "Network", usage: "ip addr | ip route | ip neigh", summary: "Show addresses, routes or the neighbour (ARP) table.", notes: "ip addr   the address of this device\nip route  where packets for each network go\nip neigh  addresses learned from neighbours" },
    Entry { name: "ipconfig", group: "Network", usage: "ipconfig [/release | /renew]", summary: "Show the adapter settings, or release and renew the DHCP lease.", notes: "ifconfig is the same command.\nipconfig /renew asks a DHCP server for an address." },
    Entry { name: "ping", group: "Network", usage: "ping [-n N] <host>", summary: "Send echo requests to see if a host answers (default 4, max 20).", notes: "-c N works like -n N.\nA host can be an address (192.168.1.1) or a name.\nNo answer can mean a cable, a route or a firewall rule is missing." },
    Entry { name: "nc6", group: "Network", usage: "nc6 [-u] <address> <port>", summary: "Open one IPv6 TCP or UDP connection on the same L2 segment.", notes: "IPv6 routing is not modelled. The target ufw decides by protocol and port." },
    Entry { name: "ping6", group: "Network", usage: "ping6 <address>", summary: "Send one IPv6 echo over the same L2 segment.", notes: "IPv6 routing is not modelled, so a host behind a router times out.\nA deny rule on the target can also stop the echo." },
    Entry { name: "tracert", group: "Network", usage: "tracert [-h N] <host>", summary: "Show every router on the way to a host, at most N hops (default 30).", notes: "traceroute is the same command.\nThe last hop that answers is where the trouble starts." },
    Entry { name: "arp", group: "Network", usage: "arp -a | arp -d", summary: "Show the ARP cache, or clear it.", notes: "ARP maps an IP address to the MAC address on the same segment." },
    Entry { name: "route", group: "Network", usage: "route print", summary: "Show the IPv4 routing table.", notes: "The row 0.0.0.0 is the default route: where unknown networks go." },
    Entry { name: "nslookup", group: "Network", usage: "nslookup <name>", summary: "Ask the DNS server for the address of a name.", notes: "Needs a DNS server set in IP Configuration." },
    Entry { name: "netstat", group: "Network", usage: "netstat", summary: "Show local sockets and listening ports.", notes: "ss is the same command." },
    Entry { name: "ufw", group: "Firewall", usage: "sudo ufw <command>", summary: "Manage this device's firewall.", notes: "sudo ufw status [verbose|numbered]\nsudo ufw enable | disable | reset\nsudo ufw default deny|allow incoming\nsudo ufw allow|deny <port>[/tcp|/udp]    sudo ufw allow 22/tcp\nsudo ufw allow|deny from <ip>[/prefix]   sudo ufw deny from 10.0.0.5\nsudo ufw allow from <ip> to any port <n> sudo ufw allow from 10.0.0.0/24 to any port 22\nsudo ufw delete <number>                  number from 'ufw status numbered'\nWith the firewall on, incoming traffic is denied unless a rule allows it.\nPing is allowed unless a rule denies it: sudo ufw deny proto icmp from any." },
    Entry { name: "ssh", group: "Remote", usage: "ssh [-p PASSWORD] [user@]<host>", summary: "Open a command session on a router or switch by its address.", notes: "A target with users needs a trusted key from ssh-copy-id, or the matching password with -p.\nType exit to come back." },
    Entry { name: "ssh-keygen", group: "Remote", usage: "ssh-keygen", summary: "Create the PC key pair used for ssh logins.", notes: "One key per device; ssh-copy-id trusts it on a target." },
    Entry { name: "ssh-copy-id", group: "Remote", usage: "ssh-copy-id user@host", summary: "Trust this PC key for one user on a target.", notes: "The target needs a user and a generated host key." },
    Entry { name: "telnet", group: "Remote", usage: "telnet <host>", summary: "Open a command session on a router or switch by its address.", notes: "Plain text and old; prefer ssh. Type exit to come back." },
    Entry { name: "console", group: "Remote", usage: "console", summary: "Open the session over the console cable plugged into this device.", notes: "Needs a Console cable from this device to a router or switch.\nType exit to come back." },
    Entry { name: "hostname", group: "Session", usage: "hostname", summary: "Print this device's name.", notes: "" },
    Entry { name: "whoami", group: "Session", usage: "whoami", summary: "Print the user you are logged in as.", notes: "" },
    Entry { name: "sudo", group: "Session", usage: "sudo <command>", summary: "Run one command as the administrator.", notes: "ufw needs it." },
    Entry { name: "clear", group: "Session", usage: "clear", summary: "Clear the screen.", notes: "cls is the same command." },
    Entry { name: "exit", group: "Session", usage: "exit", summary: "Leave a router session, or close the terminal.", notes: "" },
    Entry { name: "help", group: "Session", usage: "help | <command> --help", summary: "List the commands, or explain one.", notes: "-h and /? work as well as --help." },
];

pub(super) fn canonical(name: &str) -> &str {
    match name {
        "ifconfig" => "ipconfig",
        "traceroute" => "tracert",
        "ss" => "netstat",
        "cls" => "clear",
        other => other,
    }
}

#[cfg(test)]
pub(super) fn is_known(name: &str) -> bool {
    let name = canonical(name);
    COMMANDS.iter().any(|entry| entry.name == name)
}

/// `-h` is a real option of tracert (the hop limit), so it asks for help everywhere else.
pub(super) fn wants_help(verb: &str, args: &[&str]) -> bool {
    match args {
        [only] => matches!(*only, "--help" | "/?" | "-?") || (*only == "-h" && canonical(verb) != "tracert"),
        [first, ..] => matches!(*first, "--help" | "/?"),
        [] => false,
    }
}

/// The full list, grouped, for `help`.
pub(super) fn overview() -> String {
    let mut out = String::from("Takumi terminal. Type <command> --help to learn one command.\n");
    let mut group = "";
    for entry in COMMANDS {
        if entry.group != group {
            group = entry.group;
            out.push_str(&format!("\n{group}\n"));
        }
        out.push_str(&wrapped_row(entry.usage, entry.summary));
    }
    out.push('\n');
    out
}

/// One command row. Descriptions wrap at 80 columns and stay aligned under
/// the description column, so a long summary never falls back to the margin.
fn wrapped_row(usage: &str, summary: &str) -> String {
    const PREFIX: usize = 36;
    let budget = 80usize.saturating_sub(PREFIX);
    let mut lines: Vec<String> = Vec::new();
    let mut current = String::new();
    for word in summary.split_whitespace() {
        if !current.is_empty() && current.len() + 1 + word.len() > budget {
            lines.push(std::mem::take(&mut current));
        }
        if !current.is_empty() {
            current.push(' ');
        }
        current.push_str(word);
    }
    lines.push(current);
    let mut out = format!("  {usage:<34}{}\n", lines[0]);
    for line in &lines[1..] {
        out.push_str(&format!("  {:<34}{}\n", "", line));
    }
    out
}

/// `COMMAND --help`.
pub(super) fn command_help(name: &str) -> Option<String> {
    let name = canonical(name);
    let entry = COMMANDS.iter().find(|entry| entry.name == name)?;
    let mut out = format!("{}\n\nUsage: {}\n", entry.summary, entry.usage);
    if !entry.notes.is_empty() {
        out.push('\n');
        for line in entry.notes.lines() {
            out.push_str(&format!("  {line}\n"));
        }
    }
    out.push('\n');
    Some(out)
}
