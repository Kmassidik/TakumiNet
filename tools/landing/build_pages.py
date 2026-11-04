"""Writes the four public pages (landing and About, in English and Indonesian).

  python3 tools/landing/build_pages.py

One template, two sets of words, so the two languages can never drift apart in
structure. Writes web/landing.html, web/landing.id.html, web/about.html and
web/about.id.html. `{{SITE_URL}}` is replaced by the server when it sends a page.
"""
import json
from pathlib import Path

WEB = Path(__file__).resolve().parents[2] / "web"
REPO = "https://github.com/Kmassidik/TakumiNet"
X = "https://x.com/KMassidik"

EXAMPLES = [("tpl-connect", 0), ("tpl-star", 1), ("tpl-home", 2), ("tpl-routed", 3), ("tpl-web", 4)]
LESSONS = ["t1", "t2", "t3", "t4", "t5"]

T = {
    "en": {
        "code": "en", "locale": "en_US", "other": "id",
        "landing_path": "/", "about_path": "/about",
        "landing_title": "Takumi: free network lab in your browser",
        "landing_desc": "Build networks with routers, switches and computers, then follow every packet. Free, no account, works offline in your browser.",
        "about_title": "About Takumi: a free, open source network lab",
        "about_desc": "Takumi is a free network lab that runs in your browser. One person builds it and anyone can change it. Open source under the MIT licence.",
        "og_alt": "Takumi the bear next to the words Takumi, a network lab in your browser",
        "nav_about": "About", "nav_home": "Home", "nav_lang": "Bahasa Indonesia", "nav_lang_short": "ID", "nav_cta": "Open the workspace",
        "skip": "Skip to content",
        "h1": "Build a network and watch it work.",
        "lede": "A free network lab in your browser. Drop in routers, switches and computers, run a cable between them, then follow every packet from one device to the next.",
        "cta": "Open the workspace", "cta2": "Try two networks and a router",
        "phone": "The workspace needs a computer or a tablet. Open this page there to start building.",
        "wave_alt": "Takumi the bear waving hello",
        "wire_h": "Wire it up",
        "wire_p": "Pick a category, drag a device onto the canvas, then connect two devices with the right cable: copper straight-through, crossover, serial, fiber or console. Set addresses in the device window, like on real equipment.",
        "tabs": ["Routers", "Switches", "End devices", "Wireless"], "tiles": ["PC-PT", "Laptop", "Server", "Printer"],
        "follow_h": "Follow the packet",
        "follow_p": "Press Play and each device makes its decision in turn: ARP, DNS, ping, a web page. Open any captured frame to read its layers and its bytes, and filter the list by protocol.",
        "mini_head": ["Time", "Last device", "At device", "Type"],
        "cap_head": ["Time", "From", "At", "Type", "Info"],
        "cap_rows": ["PC0 asks who has 192.168.1.1", "Router0 answers with its address", "Echo request arrives with TTL 127"],
        "check_h": "Check your work",
        "check_p": "Guided lessons give you steps to do, and checks that read the live network. When something fails you see what was expected, what the network did, and a hint.",
        "checks": ["PC0 reaches PC3 through Router0", "The router decrements the delivered TTL to 127", "Router0 has the left connected prefix"], "not_yet": "Not checked yet",
        "start_h": "Start from a network that already runs",
        "ex_h": "Example networks", "les_h": "Guided lessons",
        "examples": [
            ("Two computers", "PC0 and PC1 on one cable, ready to ping"),
            ("Three computers on a switch", "PC0, PC1 and PC2 ready to talk through Switch0"),
            ("Home network", "Laptop0 and PC0 reach Server0's web page"),
            ("Two networks and a router", "PC0 reaches PC3 through Router0"),
            ("Website by name", "PC0 looks up www.takumi.lab and opens the site")],
        "lessons": [
            ("Connect two computers", "PC0 can ping PC1"),
            ("A star network with a switch", "Three PCs talk and Switch0 learns their MAC addresses"),
            ("Home network with automatic addresses", "Computers lease addresses, then open a web page"),
            ("Two networks joined by a router", "Reach PC3 through Router0 with TTL 127"),
            ("Visit a website by name", "Resolve www.takumi.lab and open the website")],
        "faq_h": "Questions people ask",
        "faq": [
            ("Is Takumi free?", "Yes. It is free to use and open source under the MIT licence."),
            ("Do I need an account or an install?", "No. Open it in your browser and start building. There is nothing to install."),
            ("Does it work offline?", "Yes. After your first visit the page, the network engine and the pictures are saved in your browser, so it keeps working without a connection."),
            ("Where are my networks saved?", "On your own computer. Save a network as an .xml file and open it again later. Nothing is uploaded."),
            ("Can I use it to teach a class?", "Yes. The guided lessons and ready-made example networks are made for classrooms, and you can share any network as an .xml file.")],
        "free_h": "Free, and yours to change",
        "free_p": "Takumi runs entirely in your browser, so your networks stay on your machine. It needs no account and works offline once it has loaded. The engine, the interface and every picture are original work, released under the MIT licence. Anyone can send a pull request or fork it and build their own version.",
        "src": "Source on GitHub", "follow_x": "Follow the author on X",
        "foot1": "Original code, artwork and sounds.", "foot2": "MIT licence, 2026 Kurnia Massidik", "foot_about": "About Takumi", "foot_home": "Back to the home page",
        "about_h1": "About Takumi",
        "about_lede": "A free network lab that runs in your browser. No account, no install. One person builds it, and anyone can change it.",
        "why_h": "Why it exists",
        "why_p": "Learning how networks work should not need an account, an installer or a licence key. Takumi opens in a browser tab, works offline after your first visit, and keeps your networks on your own computer.",
        "who_h": "Who makes it",
        "who_p": "Takumi is built and looked after by Kurnia Massidik. Found a bug or have an idea? Say hello on X, or open an issue on GitHub.",
        "who_x": "Find me on X", "who_gh": "Open GitHub",
        "open_h": "Open for everyone",
        "open_p": "Open source under the MIT licence. Fork it and build your own version, or send a pull request and help make this one better.",
        "open_b": "Read the code",
        "inside_h": "What is inside",
        "inside": [("The engine", "Written in Rust and compiled to WebAssembly, so the whole network runs inside your browser tab."),
                   ("The interface", "Plain HTML, CSS and TypeScript, with the workspace drawn on a canvas. Nothing to install."),
                   ("The art and sounds", "Every picture and every sound is original to this project.")],
        "app_desc": "A free network lab in the browser: build networks, follow every packet, and check your work with guided lessons.",
    },
    "id": {
        "code": "id", "locale": "id_ID", "other": "en",
        "landing_path": "/id", "about_path": "/id/about",
        "landing_title": "Takumi: lab jaringan gratis di browser",
        "landing_desc": "Bangun jaringan dengan router, switch, dan komputer, lalu ikuti setiap paket. Gratis, tanpa akun, dan bisa dipakai offline di browser.",
        "about_title": "Tentang Takumi: lab jaringan gratis dan open source",
        "about_desc": "Takumi adalah lab jaringan gratis yang berjalan di browser. Dibuat satu orang, dan siapa pun boleh mengubahnya. Open source dengan lisensi MIT.",
        "og_alt": "Takumi si beruang di samping tulisan Takumi, lab jaringan di browser",
        "nav_about": "Tentang", "nav_home": "Beranda", "nav_lang": "English", "nav_lang_short": "EN", "nav_cta": "Buka workspace",
        "skip": "Langsung ke isi halaman",
        "h1": "Bangun jaringan dan lihat cara kerjanya.",
        "lede": "Lab jaringan gratis di browser. Pasang router, switch, dan komputer, tarik kabel di antaranya, lalu ikuti setiap paket dari satu perangkat ke perangkat berikutnya.",
        "cta": "Buka workspace", "cta2": "Coba dua jaringan dan satu router",
        "phone": "Workspace butuh komputer atau tablet. Buka halaman ini di sana untuk mulai membangun.",
        "wave_alt": "Takumi si beruang melambaikan tangan",
        "wire_h": "Rangkai jaringan",
        "wire_p": "Pilih kategori, seret perangkat ke kanvas, lalu hubungkan dua perangkat dengan kabel yang tepat: copper straight-through, crossover, serial, fiber, atau console. Atur alamat di jendela perangkat, seperti di perangkat sungguhan.",
        "tabs": ["Router", "Switch", "Perangkat akhir", "Nirkabel"], "tiles": ["PC-PT", "Laptop", "Server", "Printer"],
        "follow_h": "Ikuti paketnya",
        "follow_p": "Tekan Play dan setiap perangkat mengambil keputusannya satu per satu: ARP, DNS, ping, halaman web. Buka frame mana pun untuk melihat lapisan dan byte-nya, lalu saring daftar berdasarkan protokol.",
        "mini_head": ["Waktu", "Perangkat asal", "Di perangkat", "Tipe"],
        "cap_head": ["Waktu", "Dari", "Di", "Tipe", "Info"],
        "cap_rows": ["PC0 bertanya siapa pemilik 192.168.1.1", "Router0 menjawab dengan alamatnya", "Permintaan echo tiba dengan TTL 127"],
        "check_h": "Periksa hasilmu",
        "check_p": "Pelajaran terpandu memberi langkah yang harus dikerjakan, dan pemeriksaan yang membaca jaringan secara langsung. Saat ada yang gagal, kamu melihat apa yang diharapkan, apa yang terjadi, dan petunjuknya.",
        "checks": ["PC0 menjangkau PC3 lewat Router0", "Router menurunkan TTL yang sampai menjadi 127", "Router0 punya prefix yang terhubung di sisi kiri"], "not_yet": "Belum diperiksa",
        "start_h": "Mulai dari jaringan yang sudah jalan",
        "ex_h": "Contoh jaringan", "les_h": "Pelajaran terpandu",
        "examples": [
            ("Dua komputer", "PC0 dan PC1 di satu kabel, siap di-ping"),
            ("Tiga komputer pada satu switch", "PC0, PC1, dan PC2 siap saling bicara lewat Switch0"),
            ("Jaringan rumah", "Laptop0 dan PC0 membuka halaman web Server0"),
            ("Dua jaringan dan satu router", "PC0 menjangkau PC3 lewat Router0"),
            ("Website lewat nama", "PC0 mencari www.takumi.lab lalu membuka situsnya")],
        "lessons": [
            ("Hubungkan dua komputer", "PC0 bisa me-ping PC1"),
            ("Jaringan bintang dengan switch", "Tiga PC saling bicara dan Switch0 belajar alamat MAC mereka"),
            ("Jaringan rumah dengan alamat otomatis", "Komputer meminjam alamat, lalu membuka halaman web"),
            ("Dua jaringan dihubungkan router", "Jangkau PC3 lewat Router0 dengan TTL 127"),
            ("Buka website lewat nama", "Cari www.takumi.lab lalu buka websitenya")],
        "faq_h": "Pertanyaan yang sering muncul",
        "faq": [
            ("Apakah Takumi gratis?", "Ya. Takumi gratis dipakai dan open source dengan lisensi MIT."),
            ("Perlu akun atau instalasi?", "Tidak. Buka di browser dan langsung mulai membangun. Tidak ada yang perlu dipasang."),
            ("Apakah bisa dipakai offline?", "Bisa. Setelah kunjungan pertama, halaman, mesin jaringan, dan gambar-gambarnya tersimpan di browser, jadi tetap berjalan tanpa koneksi."),
            ("Di mana jaringan saya disimpan?", "Di komputer kamu sendiri. Simpan jaringan sebagai file .xml lalu buka lagi nanti. Tidak ada yang diunggah."),
            ("Bisakah dipakai untuk mengajar di kelas?", "Bisa. Pelajaran terpandu dan contoh jaringan dibuat untuk ruang kelas, dan jaringan apa pun bisa dibagikan sebagai file .xml.")],
        "free_h": "Gratis, dan bebas kamu ubah",
        "free_p": "Takumi berjalan sepenuhnya di browser, jadi jaringanmu tetap ada di komputermu. Tidak perlu akun, dan bisa dipakai offline setelah selesai dimuat. Mesin, antarmuka, dan semua gambarnya adalah karya orisinal, dirilis dengan lisensi MIT. Siapa pun boleh mengirim pull request atau membuat versinya sendiri.",
        "src": "Kode di GitHub", "follow_x": "Ikuti pembuatnya di X",
        "foot1": "Kode, gambar, dan suara orisinal.", "foot2": "Lisensi MIT, 2026 Kurnia Massidik", "foot_about": "Tentang Takumi", "foot_home": "Kembali ke beranda",
        "about_h1": "Tentang Takumi",
        "about_lede": "Lab jaringan gratis yang berjalan di browser. Tanpa akun, tanpa instalasi. Dibuat oleh satu orang, dan siapa pun boleh mengubahnya.",
        "why_h": "Kenapa dibuat",
        "why_p": "Belajar cara kerja jaringan seharusnya tidak butuh akun, installer, atau kunci lisensi. Takumi terbuka di tab browser, bisa dipakai offline setelah kunjungan pertama, dan menyimpan jaringanmu di komputermu sendiri.",
        "who_h": "Siapa yang membuatnya",
        "who_p": "Takumi dibuat dan dirawat oleh Kurnia Massidik. Menemukan bug atau punya ide? Sapa di X, atau buka issue di GitHub.",
        "who_x": "Temui saya di X", "who_gh": "Buka GitHub",
        "open_h": "Terbuka untuk semua",
        "open_p": "Open source dengan lisensi MIT. Salin dan bangun versimu sendiri, atau kirim pull request untuk membantu memperbaiki yang ini.",
        "open_b": "Baca kodenya",
        "inside_h": "Isi di dalamnya",
        "inside": [("Mesin jaringan", "Ditulis dengan Rust dan dikompilasi ke WebAssembly, jadi seluruh jaringan berjalan di dalam tab browsermu."),
                   ("Antarmuka", "HTML, CSS, dan TypeScript biasa, dengan workspace yang digambar di kanvas. Tidak ada yang perlu dipasang."),
                   ("Gambar dan suara", "Setiap gambar dan setiap suara adalah karya orisinal untuk proyek ini.")],
        "app_desc": "Lab jaringan gratis di browser: bangun jaringan, ikuti setiap paket, dan periksa hasilmu lewat pelajaran terpandu.",
    },
}


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def head(t, kind):
    path = t["landing_path"] if kind == "landing" else t["about_path"]
    title = t["landing_title"] if kind == "landing" else t["about_title"]
    desc = t["landing_desc"] if kind == "landing" else t["about_desc"]
    en_path = T["en"]["landing_path"] if kind == "landing" else T["en"]["about_path"]
    id_path = T["id"]["landing_path"] if kind == "landing" else T["id"]["about_path"]
    other = T[t["other"]]
    og_img = f"{{{{SITE_URL}}}}/landing/og-{t['code']}.png"
    person = {"@type": "Person", "name": "Kurnia Massidik", "url": X, "sameAs": [X, "https://github.com/Kmassidik"]}
    app = {
        "@type": "SoftwareApplication", "@id": "{{SITE_URL}}/#app", "name": "Takumi", "url": "{{SITE_URL}}" + path,
        "description": t["app_desc"], "applicationCategory": "EducationalApplication", "operatingSystem": "Any (web browser)",
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}, "inLanguage": t["code"],
        "license": "https://opensource.org/licenses/MIT", "isAccessibleForFree": True, "image": og_img, "author": person,
        "codeRepository": REPO,
    }
    graph = [
        {"@type": "WebSite", "@id": "{{SITE_URL}}/#site", "name": "Takumi", "url": "{{SITE_URL}}" + path, "inLanguage": t["code"]},
        app,
    ]
    if kind == "landing":
        graph.append({"@type": "FAQPage", "inLanguage": t["code"], "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in t["faq"]]})
    else:
        graph.append({"@type": "AboutPage", "name": title, "url": "{{SITE_URL}}" + path, "inLanguage": t["code"], "about": {"@id": "{{SITE_URL}}/#app"}})
    ld = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2)
    return f'''<!doctype html>
<html lang="{t["code"]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#ffffff">
<meta name="author" content="Kurnia Massidik">
<link rel="canonical" href="{{{{SITE_URL}}}}{path}">
<link rel="alternate" hreflang="en" href="{{{{SITE_URL}}}}{en_path}">
<link rel="alternate" hreflang="id" href="{{{{SITE_URL}}}}{id_path}">
<link rel="alternate" hreflang="x-default" href="{{{{SITE_URL}}}}{en_path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Takumi">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{{{{SITE_URL}}}}{path}">
<meta property="og:locale" content="{t["locale"]}">
<meta property="og:locale:alternate" content="{other["locale"]}">
<meta property="og:image" content="{og_img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{esc(t["og_alt"])}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:creator" content="@KMassidik">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(desc)}">
<meta name="twitter:image" content="{og_img}">
<link rel="icon" type="image/webp" href="/art3d/mascot/idle.webp">
<link rel="preload" as="image" href="/landing/takumi-wave.webp" type="image/webp" fetchpriority="high">
<link rel="stylesheet" href="/tokens.css">
<link rel="stylesheet" href="/landing.css">
<script type="application/ld+json">
{ld}
</script>
</head>
'''


def top(t, kind):
    home = t["landing_path"]
    about = t["about_path"]
    other = T[t["other"]]
    switch = other["landing_path"] if kind == "landing" else other["about_path"]
    return f'''<body>
<a class="skip" href="#main">{esc(t["skip"])}</a>
<header class="top">
  <a class="brand" href="{home}"><img src="/art3d/mascot/idle.webp" alt="" width="34" height="34">Takumi</a>
  <nav aria-label="Site">
    <a href="{about if kind == "landing" else home}">{esc(t["nav_about"] if kind == "landing" else t["nav_home"])}</a>
    <a href="{REPO}" rel="noopener noreferrer">GitHub</a>
    <a class="lang" href="{switch}" hreflang="{other["code"]}" lang="{other["code"]}" title="{esc(t["nav_lang"])}">{other["code"].upper()}</a>
    <a class="pill solid small only-computer" href="/workspace">{esc(t["nav_cta"])}</a>
  </nav>
</header>
'''


def img(pose, alt, eager=False):
    load = ' fetchpriority="high"' if eager else ' loading="lazy" decoding="async"'
    return f'<img src="/landing/takumi-{pose}.webp" alt="{esc(alt)}" width="512" height="512"{load}>'


def landing(t):
    ex = "\n".join(
        f'          <li><a href="/workspace?open={tid}"><strong>{esc(t["examples"][i][0])}</strong><span>{esc(t["examples"][i][1])}</span></a></li>'
        for tid, i in EXAMPLES)
    les = "\n".join(
        f'          <li><a href="/workspace?open={lid}"><strong>{esc(t["lessons"][i][0])}</strong><span>{esc(t["lessons"][i][1])}</span></a></li>'
        for i, lid in enumerate(LESSONS))
    tabs = "".join(f'<span class="on">{esc(x)}</span>' if i == 2 else f"<span>{esc(x)}</span>" for i, x in enumerate(t["tabs"]))
    tiles = "\n".join(f'            <span><img src="/art3d/devices/{f}.webp" alt="" width="40" height="40" loading="lazy">{esc(n)}</span>'
                      for f, n in zip(["pc", "laptop", "server", "printer"], t["tiles"]))
    faq = "\n".join(f'        <details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q, a in t["faq"])
    ch = t["cap_head"]
    mh = t["mini_head"]
    c = t["checks"]
    return head(t, "landing") + top(t, "landing") + f'''
<main id="main">
  <section class="hero">
    <h1>{esc(t["h1"])}</h1>
    <p class="lede">{esc(t["lede"])}</p>
    <p class="actions only-computer">
      <a class="pill solid" href="/workspace">{esc(t["cta"])}</a>
      <a class="pill line" href="/workspace?open=tpl-routed">{esc(t["cta2"])}</a>
    </p>
    <p class="phone-note">{esc(t["phone"])}</p>

    <div class="peek">
      <div class="slot slot-hero">{img("wave", t["wave_alt"], eager=True)}</div>
      <div class="card hard cap-card">
        <table class="cap" aria-label="Example captured packets">
          <thead><tr><th>{ch[0]}</th><th>{ch[1]}</th><th>{ch[2]}</th><th>{ch[3]}</th><th>{ch[4]}</th></tr></thead>
          <tbody>
            <tr><td>0.003</td><td>PC0</td><td>Router0</td><td class="t-arp">ARP</td><td>{esc(t["cap_rows"][0])}</td></tr>
            <tr><td>0.006</td><td>Router0</td><td>PC0</td><td class="t-arp">ARP</td><td>{esc(t["cap_rows"][1])}</td></tr>
            <tr class="now"><td>0.009</td><td>PC0</td><td>PC3</td><td class="t-icmp">ICMP</td><td>{esc(t["cap_rows"][2])}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="block ink" aria-labelledby="wire">
    <div class="block-grid">
      <div class="say">
        <h2 id="wire">{esc(t["wire_h"])}</h2>
        <p>{esc(t["wire_p"])}</p>
        <div class="card flat tiles" aria-hidden="true">
          <div class="tabs">{tabs}</div>
          <div class="tilerow">
{tiles}
          </div>
        </div>
      </div>
      <div class="slot">{img("idle", "")}</div>
    </div>
  </section>

  <section class="block teal" aria-labelledby="follow">
    <div class="block-grid flip">
      <div class="slot">{img("think", "")}</div>
      <div class="say">
        <h2 id="follow">{esc(t["follow_h"])}</h2>
        <p>{esc(t["follow_p"])}</p>
        <div class="card flat" aria-hidden="true">
          <table class="mini">
            <thead><tr><th>{mh[0]}</th><th>{mh[1]}</th><th>{mh[2]}</th><th>{mh[3]}</th></tr></thead>
            <tbody>
              <tr><td>0.003</td><td>PC0</td><td>Switch0</td><td class="t-dns">DNS</td></tr>
              <tr><td>0.007</td><td>Switch0</td><td>Server0</td><td class="t-arp">ARP</td></tr>
              <tr class="now"><td>0.011</td><td>PC0</td><td>Server0</td><td class="t-http">HTTP</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <section class="block grey" aria-labelledby="check">
    <div class="block-grid">
      <div class="say">
        <h2 id="check">{esc(t["check_h"])}</h2>
        <p>{esc(t["check_p"])}</p>
        <ul class="card flat checks" aria-hidden="true">
          <li class="pass"><span></span>{esc(c[0])}</li>
          <li class="pass"><span></span>{esc(c[1])}</li>
          <li class="todo"><span></span>{esc(c[2])}<small>{esc(t["not_yet"])}</small></li>
        </ul>
      </div>
      <div class="slot">{img("happy", "")}</div>
    </div>
  </section>

  <section class="start" aria-labelledby="start">
    <h2 id="start">{esc(t["start_h"])}</h2>
    <div class="lists">
      <div class="card hard">
        <h3>{esc(t["ex_h"])}</h3>
        <ul>
{ex}
        </ul>
      </div>
      <div class="card hard">
        <h3>{esc(t["les_h"])}</h3>
        <ul>
{les}
        </ul>
      </div>
    </div>
  </section>

  <section class="start faq" aria-labelledby="faq">
    <h2 id="faq">{esc(t["faq_h"])}</h2>
    <div class="faq-list">
{faq}
    </div>
  </section>

  <section class="block ink free" aria-labelledby="free">
    <div class="block-grid">
      <div class="say">
        <h2 id="free">{esc(t["free_h"])}</h2>
        <p>{esc(t["free_p"])}</p>
        <p class="actions">
          <a class="pill solid brand only-computer" href="/workspace">{esc(t["cta"])}</a>
          <a class="pill line light" href="{REPO}" rel="noopener noreferrer">{esc(t["src"])}</a>
          <a class="pill line light" href="{X}" rel="noopener noreferrer">{esc(t["follow_x"])}</a>
        </p>
      </div>
      <div class="slot">{img("wave", "")}</div>
    </div>
  </section>
</main>

<footer class="foot">
  <span>{esc(t["foot1"])}</span>
  <a href="{t["about_path"]}">{esc(t["foot_about"])}</a>
  <span>{esc(t["foot2"])}</span>
</footer>
</body>
</html>
'''


def about(t):
    inside = "\n".join(f'''      <div class="card hard">
        <h3>{esc(h)}</h3>
        <p>{esc(p)}</p>
      </div>''' for h, p in t["inside"])
    return head(t, "about") + top(t, "about") + f'''
<main id="main">
  <section class="hero">
    <h1>{esc(t["about_h1"])}</h1>
    <p class="lede">{esc(t["about_lede"])}</p>
    <div class="peek">
      <div class="slot slot-hero">{img("wave", t["wave_alt"], eager=True)}</div>
    </div>
  </section>

  <section class="block ink" aria-labelledby="why">
    <div class="block-grid">
      <div class="say">
        <h2 id="why">{esc(t["why_h"])}</h2>
        <p>{esc(t["why_p"])}</p>
      </div>
      <div class="slot">{img("idle", "")}</div>
    </div>
  </section>

  <section class="block teal" aria-labelledby="who">
    <div class="block-grid flip">
      <div class="slot">{img("think", "")}</div>
      <div class="say">
        <h2 id="who">{esc(t["who_h"])}</h2>
        <p>{esc(t["who_p"])}</p>
        <p class="actions left">
          <a class="pill line" href="{X}" rel="noopener noreferrer">{esc(t["who_x"])}</a>
          <a class="pill line" href="{REPO}" rel="noopener noreferrer">{esc(t["who_gh"])}</a>
        </p>
      </div>
    </div>
  </section>

  <section class="block grey" aria-labelledby="open">
    <div class="block-grid">
      <div class="say">
        <h2 id="open">{esc(t["open_h"])}</h2>
        <p>{esc(t["open_p"])}</p>
        <p class="actions left"><a class="pill solid" href="{REPO}" rel="noopener noreferrer">{esc(t["open_b"])}</a></p>
      </div>
      <div class="slot">{img("happy", "")}</div>
    </div>
  </section>

  <section class="start" aria-labelledby="inside">
    <h2 id="inside">{esc(t["inside_h"])}</h2>
    <div class="lists">
{inside}
    </div>
  </section>
</main>

<footer class="foot">
  <span>{esc(t["foot1"])}</span>
  <a href="{t["landing_path"]}">{esc(t["foot_home"])}</a>
  <span>{esc(t["foot2"])}</span>
</footer>
</body>
</html>
'''


PAGES = {
    "landing.html": lambda: landing(T["en"]),
    "landing.id.html": lambda: landing(T["id"]),
    "about.html": lambda: about(T["en"]),
    "about.id.html": lambda: about(T["id"]),
}

if __name__ == "__main__":
    import sys

    if "--check" in sys.argv:  # exit 1 when a page on disk is not what the template makes
        stale = [name for name, make in PAGES.items() if (WEB / name).read_text() != make()]
        print("stale:", stale if stale else "none")
        sys.exit(1 if stale else 0)
    for name, make in PAGES.items():
        (WEB / name).write_text(make())
    print("wrote", len(PAGES), "pages")
