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

EXAMPLES = [("tpl-connect", 0), ("tpl-star", 1), ("tpl-home", 2), ("tpl-routed", 3), ("tpl-web", 4),
            ("tpl-l1-wifi-home", 5), ("tpl-l1-two-rooms", 6), ("tpl-l1-broken-wifi", 7),
            ("tpl-l3-office-vlans", 8),
            ("tpl-l4-campus-ospf", 9),
            ("tpl-l3-office-vpn", 10)]
LESSONS = ["t1", "t2", "t3", "t4", "t5", "les-l1-01-router-login", "les-l1-02-wifi-name", "les-l1-03-guest-wifi", "les-l1-04-reserve-address", "les-l1-05-port-forward", "les-l1-06-far-room", "les-l1-07-find-the-fault", "les-l3-01-three-vlans", "les-l3-02-inter-vlan", "les-l3-04-acl-fence", "les-l4-03-ospf-campus", "les-l3-05-port-security", "les-l3-06-remote-owner", "les-l3-03-dhcp-per-vlan"]

from words import T



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
