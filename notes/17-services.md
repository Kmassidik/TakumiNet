# 17 — DNS and per-server HTTP pages

Status: landed 2026-11-01.

## DNS

State is per server: `Workspace::dns_records: HashMap<server_id, Vec<(name, ip)>>`
(lower-case names, sorted so saves are deterministic).

`set_dns_record(id, name, ip)` validates the address and name (no whitespace),
replaces an existing record and re-sorts. `resolve_name(client, name)` finds
the server configured in the client's DNS field and queries its record table,
so resolution works across routers. `nslookup`, `ping`, and `webapp::fetch`
share this resolver for non-literal targets.

`nslookup NAME` in the Command Prompt now prints:

```
Server:  dns
Address:  192.168.2.20

Non-authoritative answer:
Name:    web.lab
Address:  192.168.2.20
```

or the Windows timeout text when no record answers.

Endpoints: `POST /api/devices/dns?id=&name=&ip=` and `?…&remove=1`.

## HTTP pages

`Workspace::http_pages: HashMap<server_id, String>` replaces the default welcome
page for that server; `webapp::fetch` serves it after the delivery is captured
as an `HTTP` event. `POST /api/devices/http?id=&body=` sets it (empty body
restores the default).

## Persistence

Both are saved as `dns`/`page` lines (page text escaped like banners), so the
round-trip test asserts `resolve_name` and the page body survive save → load and
that the file stays byte-identical.

## Not yet

- No UI editor for records/pages (API + Command Prompt only so far).
- No TFTP, FTP, SMTP/POP3, NTP, AAA or Syslog servers yet.
