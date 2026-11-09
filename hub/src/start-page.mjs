/**
 * The /start page: who King Fee is and one button per door. No prices here
 * (each company's site owns its prices), no trackers, no outside requests.
 */

const MAIN = [
  {
    door: 'websites',
    title: 'Your own .com + booking',
    sub: 'Own Your .com by Fee The Developer',
  },
  {
    door: 'build',
    title: 'A bigger site for your business',
    sub: 'Custom business websites',
  },
  {
    door: 'ai',
    title: 'AI that knows your business',
    sub: 'Plugins for Claude, ChatGPT, Gemini and more',
  },
  {
    door: 'hutchrok',
    title: 'Form your business, win contracts',
    sub: 'Hutchrok Solutions Group',
  },
  { door: 'music', title: 'Music', sub: 'Fee The Producer' },
  { door: 'shop', title: 'Shop', sub: 'Runner Gang Lifestyle' },
];

const SITES = [
  { door: 'sites/beauty', label: 'Beauty' },
  { door: 'sites/realestate', label: 'Real estate' },
  { door: 'sites/transport', label: 'Auto and transport' },
  { door: 'sites/apparel', label: 'Apparel' },
  { door: 'sites/music', label: 'Music' },
  { door: 'sites/pro', label: 'Professional services' },
];

const escapeHtml = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );

export function startPage(query = '') {
  const q = escapeHtml(query);
  const main = MAIN.map(
    (b) =>
      `<li><a class="btn" href="/${b.door}${q}"><span class="t">${escapeHtml(b.title)}</span><span class="s">${escapeHtml(b.sub)}</span></a></li>`,
  ).join('');
  const sites = SITES.map(
    (b) =>
      `<li><a class="chip" href="/${b.door}${q}">${escapeHtml(b.label)}</a></li>`,
  ).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>King Fee | Start here</title>
<meta name="description" content="Army veteran. I build businesses. Websites, AI, formation and contracting, music.">
<meta name="theme-color" content="#05070B">
<style>
:root{--bg:#05070B;--panel:#0B1018;--line:rgba(255,255,255,.12);--ink:#F3F6FA;--muted:#A9B6C9;--green:#14E8B4;--blue:#2578FF}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.5}
main{max-width:560px;margin:0 auto;padding:40px 16px 56px}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--green);margin:0}
h1{font-size:40px;line-height:1.1;margin:10px 0 8px;font-weight:800;letter-spacing:-.02em}
.lead{margin:0 0 28px;color:var(--muted);font-size:17px}
ul{list-style:none;margin:0;padding:0}
.main li+li{margin-top:12px}
.btn{display:flex;flex-direction:column;gap:2px;min-height:64px;padding:14px 20px;border-radius:18px;background:var(--panel);border:1px solid var(--line);color:var(--ink);text-decoration:none}
.main li:first-child .btn{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.main li:first-child .s{color:#2B3442}
.btn .t{font-size:18px;font-weight:800}
.btn .s{font-size:14px;color:var(--muted)}
.btn:hover{border-color:var(--green)}
a:focus-visible{outline:3px solid var(--green);outline-offset:3px}
h2{font-size:14px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin:36px 0 12px}
.sites{display:flex;flex-wrap:wrap;gap:10px}
.chip{display:inline-flex;align-items:center;min-height:44px;padding:10px 16px;border-radius:999px;border:1px solid var(--line);color:var(--ink);text-decoration:none;font-weight:600;font-size:15px}
.chip:hover{border-color:var(--green)}
footer{margin-top:40px;color:var(--muted);font-size:13px}
</style>
</head>
<body>
<main>
<p class="eyebrow">King Fee</p>
<h1>Army veteran. I build businesses.</h1>
<p class="lead">Pick where you're headed.</p>
<ul class="main">${main}</ul>
<h2>See sites we've built</h2>
<ul class="sites">${sites}</ul>
<footer>realplayscorp.com</footer>
</main>
</body>
</html>`;
}
