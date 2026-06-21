const fs = require("fs");
const path = require("path");

const MAIL = "ahnimmanuel@gmail.com";
const GOOGLE = "https://policies.google.com/privacy";

const langs = [
  { code: "ko", label: "&#54620;&#44397;&#50612;" },
  { code: "en", label: "English" },
  { code: "ja", label: "&#26085;&#26412;&#35486;" },
  { code: "zh", label: "&#31616;&#20307;&#20013;&#25991;" },
  { code: "zh-TW", label: "&#32321;&#39636;&#20013;&#25991;" },
  { code: "es", label: "Espa&#241;ol" },
  { code: "fr", label: "Fran&#231;ais" },
  { code: "de", label: "Deutsch" },
];

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(s) {
  let out = esc(s);
  out = out.replace(/%%MAIL%%/g, '<a href="mailto:' + MAIL + '">' + MAIL + "</a>");
  out = out.replace(
    /%%LINK%%([\s\S]*?)%%\/LINK%%/g,
    '<a href="' + GOOGLE + '" target="_blank" rel="noopener">$1</a>'
  );
  return out;
}

function renderSection(code) {
  const raw = fs.readFileSync(path.join("src", code + ".txt"), "utf8");
  const lines = raw.replace(/\r/g, "").split("\n");
  const parts = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("@@ ")) {
      parts.push('        <p class="effective">' + inline(t.slice(3)) + "</p>");
    } else if (t.startsWith("## ")) {
      parts.push("        <h2>" + inline(t.slice(3)) + "</h2>");
    } else {
      parts.push("        <p>" + inline(t) + "</p>");
    }
  }
  return '      <section data-lang="' + code + '">\n' + parts.join("\n") + "\n      </section>";
}

const nav = langs
  .map((l) => '      <button data-go="' + l.code + '">' + l.label + "</button>")
  .join("\n");

const sections = langs.map((l) => renderSection(l.code)).join("\n");

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Moment &#8212; Privacy Policy</title>
  <style>
    :root {
      --bg: #f7f1e6;
      --card: #ffffff;
      --text: #2b2b2b;
      --muted: #6b6b6b;
      --accent: #b4734a;
      --border: #e7ddc9;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        "Helvetica Neue", Arial, "Noto Sans KR", "Noto Sans JP",
        "Noto Sans SC", "Noto Sans TC", sans-serif;
      line-height: 1.7;
    }
    .wrap { max-width: 760px; margin: 0 auto; padding: 32px 20px 64px; }
    header { text-align: center; margin-bottom: 24px; }
    header h1 { font-size: 28px; margin: 0 0 4px; }
    header .app { color: var(--accent); font-weight: 700; letter-spacing: 0.5px; }
    .subtitle { color: var(--muted); font-size: 15px; }
    .langbar { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 20px 0 28px; }
    .langbar button {
      border: 1px solid var(--border); background: var(--card); color: var(--text);
      padding: 6px 12px; border-radius: 999px; font-size: 14px; cursor: pointer;
      transition: all 0.15s ease;
    }
    .langbar button:hover { border-color: var(--accent); }
    .langbar button.active { background: var(--accent); border-color: var(--accent); color: #fff; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 28px 26px; }
    section[data-lang] { display: none; }
    section[data-lang].active { display: block; }
    h2 { font-size: 18px; margin: 26px 0 8px; }
    h2:first-of-type { margin-top: 8px; }
    .effective { color: var(--muted); font-size: 14px; margin-bottom: 8px; }
    p { margin: 8px 0; }
    a { color: var(--accent); }
    footer { text-align: center; color: var(--muted); font-size: 13px; margin-top: 28px; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1><span class="app">Moment</span></h1>
      <div class="subtitle">Privacy Policy &#183; &#44060;&#51064;&#51221;&#48372;&#52376;&#47532;&#48169;&#52840;</div>
    </header>

    <nav class="langbar" id="langbar">
${nav}
    </nav>

    <div class="card">
${sections}
    </div>

    <footer>&#169; 2026 Moment</footer>
  </div>

  <script>
    (function () {
      var supported = ["ko", "en", "ja", "zh", "zh-TW", "es", "fr", "de"];
      var sections = document.querySelectorAll("section[data-lang]");
      var buttons = document.querySelectorAll("#langbar button");
      function apply(lang) {
        if (supported.indexOf(lang) === -1) lang = "en";
        sections.forEach(function (s) { s.classList.toggle("active", s.getAttribute("data-lang") === lang); });
        buttons.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-go") === lang); });
        document.documentElement.setAttribute("lang", lang);
      }
      function detect() {
        var nav = (navigator.language || "en");
        if (/^zh\\b/i.test(nav)) { return /(TW|HK|MO|Hant)/i.test(nav) ? "zh-TW" : "zh"; }
        var base = nav.slice(0, 2).toLowerCase();
        return supported.indexOf(base) !== -1 ? base : "en";
      }
      buttons.forEach(function (b) { b.addEventListener("click", function () { apply(b.getAttribute("data-go")); }); });
      apply(detect());
    })();
  </script>
</body>
</html>
`;

fs.writeFileSync("index.html", html, "utf8");
console.log("Wrote index.html", Buffer.byteLength(html, "utf8"), "bytes");
