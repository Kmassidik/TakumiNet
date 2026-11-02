/* ---------------- email ---------------- */
/* The server field takes an address; the endpoints address servers by device
   id, so the typed value is resolved against the workspace first. */
function mailConfigKey(id) { return `pt-web:mail:${id}`; }

function openMail(d) {
  const win = document.getElementById('mail-dialog');
  const serverInput = document.getElementById('mail-server');
  const userInput = document.getElementById('mail-user');
  const passInput = document.getElementById('mail-pass');
  const accountNote = document.getElementById('mail-account-note');
  const inbox = document.getElementById('mail-inbox');
  const inboxNote = document.getElementById('mail-inbox-note');
  const toInput = document.getElementById('mail-to');
  const subjectInput = document.getElementById('mail-subject');
  const textInput = document.getElementById('mail-text');
  const mailNote = document.getElementById('mail-note');
  const fromNote = document.getElementById('mail-from');

  document.getElementById('mail-title').textContent = `Email — ${d.name}`;

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(mailConfigKey(d.id)) || '{}') || {}; } catch { /* storage blocked */ }
  serverInput.value = saved.server || (d.kind === 'server' ? d.ip || '' : '');
  userInput.value = saved.user || '';
  passInput.value = '';
  toInput.value = '';
  subjectInput.value = '';
  textInput.value = '';
  accountNote.textContent = '';
  inboxNote.textContent = '';
  mailNote.textContent = '';
  inbox.replaceChildren();
  const showFrom = () => { fromNote.textContent = userInput.value.trim() || '—'; };
  showFrom();

  const remember = () => {
    try {
      localStorage.setItem(mailConfigKey(d.id), JSON.stringify({
        server: serverInput.value.trim(),
        user: userInput.value.trim(),
      }));
    } catch { /* storage blocked */ }
  };

  /* Only server devices host a mailbox, so a typo cannot silently point the
     account at a PC. */
  const serverFor = (typed) => {
    const q = typed.trim().toLowerCase();
    if (!q) return null;
    const list = ((data && data.devices) || []).filter((x) => x.kind === 'server');
    return list.find((x) => (x.ip || '').toLowerCase() === q)
      || list.find((x) => x.name.toLowerCase() === q)
      || list.find((x) => x.id === q)
      || null;
  };

  const refreshInbox = async () => {
    const server = serverFor(serverInput.value);
    const user = userInput.value.trim();
    if (!server) {
      inboxNote.textContent = serverInput.value.trim()
        ? 'No server matches that address'
        : 'Enter the mail server address';
      return;
    }
    if (!user) {
      inboxNote.textContent = 'Enter a user name';
      return;
    }
    inboxNote.textContent = 'Loading…';
    let r;
    try {
      r = await jsonRequest('/api/mail/list', { id: server.id, user });
    } catch {
      r = { error: 'request failed' };
    }
    if (r.error) {
      inboxNote.textContent = r.error;
      return;
    }
    const messages = r.messages || [];
    inbox.replaceChildren();
    for (const m of messages) {
      const msg = document.createElement('details');
      msg.className = 'mail-msg';
      const head = document.createElement('summary');
      const subject = document.createElement('span');
      subject.className = 'mail-msg-subject';
      subject.textContent = m.read ? m.subject : `● ${m.subject}`;
      const meta = document.createElement('span');
      meta.className = 'mail-msg-meta';
      meta.textContent = `${m.from} → ${m.to}`;
      head.appendChild(subject);
      head.appendChild(meta);
      const body = document.createElement('pre');
      body.className = 'mail-msg-body';
      body.textContent = m.body;
      msg.appendChild(head);
      msg.appendChild(body);
      inbox.appendChild(msg);
    }
    if (!messages.length) {
      const empty = document.createElement('div');
      empty.className = 'meta';
      empty.textContent = 'Inbox empty';
      inbox.appendChild(empty);
    }
    inboxNote.textContent = `${messages.length} message${messages.length === 1 ? '' : 's'} for ${user}`;
  };

  document.getElementById('mail-create').onclick = async () => {
    const server = serverFor(serverInput.value);
    const user = userInput.value.trim();
    const pass = passInput.value;
    if (!server) {
      accountNote.textContent = serverInput.value.trim()
        ? 'No server matches that address'
        : 'Enter the mail server address';
      return;
    }
    if (!user || !pass) {
      accountNote.textContent = 'User and password are required';
      return;
    }
    accountNote.textContent = 'Creating…';
    const r = await api('/api/devices/mailuser', { id: server.id, user, pass });
    if (r.error) {
      accountNote.textContent = r.error;
      return;
    }
    remember();
    accountNote.textContent = `Mailbox ${user} created on ${server.name}`;
    passInput.value = '';
    sfx('popUp');
  };

  document.getElementById('mail-refresh').onclick = refreshInbox;

  document.getElementById('mail-send').onclick = async () => {
    const server = serverFor(serverInput.value);
    const user = userInput.value.trim();
    const to = toInput.value.trim();
    if (!server) {
      mailNote.textContent = serverInput.value.trim()
        ? 'No server matches that address'
        : 'Enter the mail server address';
      return;
    }
    if (!user) {
      mailNote.textContent = 'Enter a user name';
      return;
    }
    if (!to) {
      mailNote.textContent = 'Recipient is required';
      return;
    }
    mailNote.textContent = 'Sending…';
    const r = await api('/api/mail/send', {
      id: d.id,
      server: server.id,
      from: user,
      to,
      subject: subjectInput.value,
      body: textInput.value,
    });
    if (r.error) {
      mailNote.textContent = r.error;
      return;
    }
    remember();
    sfx('popUp');
    mailNote.textContent = `Sent to ${to}`;
    subjectInput.value = '';
    textInput.value = '';
    await refreshInbox();
  };

  /* The list belongs to the account it was fetched for. */
  const resetInbox = () => { inbox.replaceChildren(); inboxNote.textContent = ''; };
  serverInput.oninput = () => { remember(); resetInbox(); };
  userInput.oninput = () => { remember(); showFrom(); resetInbox(); };

  document.getElementById('mail-close').onclick = () => { win.hidden = true; };
  win.onclick = (e) => { if (e.target === win) win.hidden = true; };

  win.hidden = false;
  bringToFront(win);
  serverInput.focus();
  if (userInput.value.trim() && serverFor(serverInput.value)) refreshInbox();
}
