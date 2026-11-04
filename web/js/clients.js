/* ---------------- firewall (read-only ACL view) ---------------- */
/* NAT rules have no HTTP surface yet, so the window shows the device's ACLs
   from `show access-lists`. `en` first: the show command lives in privileged
   mode, and a fresh /api/cli session starts in user mode. */
function openFirewall(d) {
  const $ = (id) => document.getElementById(id);
  const win = $('firewall-dialog');
  const out = $('firewall-out');
  const note = $('firewall-note');

  $('firewall-title').textContent = `Firewalls — ${d.name}`;
  note.textContent = 'Read-only. ACLs are read from show access-lists over the device console; NAT rules are not available over HTTP.';
  out.textContent = 'Reading access lists…';
  win.hidden = false;
  bringToFront(win);

  (async () => {
    try {
      const en = await cliRequest('/api/cli', { id: d.id, line: 'en' });
      if (en.error) throw new Error(en.error);
      const r = await cliRequest('/api/cli', { id: d.id, line: 'show access-lists' });
      if (r.error) throw new Error(r.error);
      out.textContent = r.output ? r.output : '(no access-list output)';
    } catch {
      out.textContent = 'Serial console not available';
    }
  })();
}
