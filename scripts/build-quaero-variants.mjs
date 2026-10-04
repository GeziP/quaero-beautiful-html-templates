#!/usr/bin/env node
/**
 * Generate templates/quaero-<slug>/ from each base template, injecting shared Quaero chrome.
 *
 * Run: node scripts/build-quaero-variants.mjs
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const TEMPLATES_DIR = join(REPO_ROOT, "templates");
const SHARED_MARK = "<!--quaero-chrome-injected-->";

/** Per-base-template tweaks: hide native counters / nav that clash with Quaero chrome */
const OVERRIDES = {
  "bold-poster": {
    hideSelectors: [".progress", ".counter", ".hint"],
    frameX: "56px",
    frameInnerX: "10px",
  },
  studio: {
    hideSelectors: ["#slide-counter", "#nav-dots"],
    frameX: "72px",
    frameInnerX: "10px",
    chromeTop: "1.2vh",
  },
  signal: {
    hideSelectors: ["#slide-counter", "#nav-dots"],
    frameX: "72px",
    frameInnerX: "10px",
  },
  broadside: {
    hideSelectors: ["#slide-counter", "#nav-dots"],
    frameX: "70px",
    frameInnerX: "10px",
  },
  grove: {
    hideSelectors: ["#slide-counter", "#nav-dots"],
  },
  mat: {
    hideSelectors: ["#slide-counter", "#nav-dots"],
  },
  monochrome: {
    hideSelectors: ["#slide-counter", "#nav-dots"],
  },
  vellum: {
    hideSelectors: ["#slide-counter", "#nav-dots"],
  },
  "cobalt-grid": {
    hideSelectors: [".pagenum", ".nav-hint"],
    frameX: "70px",
    frameInnerX: "10px",
  },
  "blue-professional": {
    hideSelectors: [".slide-counter", ".nav-controls"],
  },
  "block-frame": {
    hideSelectors: [".slide-counter", ".nav-controls"],
  },
  capsule: {
    hideSelectors: [".slide-counter", ".nav-dots"],
  },
  "8-bit-orbit": {
    hideSelectors: [".slide-counter", ".nav-dots"],
  },
  coral: {
    hideSelectors: [".slide-counter", ".nav-dots"],
  },
  "daisy-days": {
    hideSelectors: [".slide-counter", ".nav-dots"],
  },
  cartesian: {
    hideSelectors: [".slide-counter", ".nav-dots"],
  },
  "retro-windows": {
    hideSelectors: [".slide-counter", ".nav-dots"],
  },
  "retro-zine": {
    hideSelectors: [".slide-counter"],
  },
  playful: {
    hideSelectors: [".slide-counter"],
  },
};

function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function buildHideCss(override) {
  if (!override || !override.hideSelectors || !override.hideSelectors.length) return "";
  return `${override.hideSelectors.join(",\n")} {\n  display: none !important;\n  visibility: hidden !important;\n}\n`;
}

function injectIntoHtml(html, override, slug) {
  if (html.includes(SHARED_MARK)) return html;

  const hideCss = buildHideCss(override);
  const extraCss = override?.extraCss ? `${override.extraCss}\n` : "";

  const headBlock = `
${SHARED_MARK}
<link rel="stylesheet" href="../_quaero-shared/chrome.css" />
<style id="quaero-chrome-overrides">
${hideCss}${extraCss}</style>
`;

  const bodyChrome = `
${SHARED_MARK}
<div class="qhi-header" aria-hidden="true">
  <span class="qhi-header-title" id="qhi-header-title">PRESENTATION</span>
  <span class="qhi-header-page" id="qhi-header-page">01 / 01</span>
</div>
<div class="quaero-footer" aria-hidden="true">
  <img class="logo-img" src="../_quaero-shared/quaero-logo.png" alt="Quaero" />
  <span class="conf-text">QUAERO Confidential - Distribution authorized to individuals with need to know only</span>
</div>
`;

  const cfg = {
    fallbackBg: override?.fallbackBg,
    luminanceThreshold: override?.luminanceThreshold,
    frameX: override?.frameX,
    frameInnerX: override?.frameInnerX,
    chromeTop: override?.chromeTop,
    chromeBottom: override?.chromeBottom,
    chromeHeaderHeight: override?.chromeHeaderHeight,
    chromeFooterHeight: override?.chromeFooterHeight,
    hideDeckOverlay: override?.hideDeckOverlay,
  };
  Object.keys(cfg).forEach((k) => {
    if (cfg[k] === undefined) delete cfg[k];
  });

  const boot = `
${SHARED_MARK}
<script>
window.__QUAERO_CHROME__ = ${JSON.stringify(cfg, null, 0)};
</script>
<script src="../_quaero-shared/chrome.js" defer></script>
`;

  let out = html;
  out = out.replace(/<head[^>]*>/i, (m) => `${m}\n${headBlock}\n`);

  const bodyMatch = out.match(/<body[^>]*>/i);
  if (!bodyMatch) throw new Error(`${slug}: no <body> tag`);
  out = out.replace(bodyMatch[0], `${bodyMatch[0]}\n${bodyChrome}\n`);

  const lastBody = out.lastIndexOf("</body>");
  if (lastBody === -1) throw new Error(`${slug}: no </body>`);
  out = out.slice(0, lastBody) + `${boot}\n` + out.slice(lastBody);

  return out;
}

function patchTemplateJson(srcDir, destDir, baseSlug) {
  const srcPath = join(srcDir, "template.json");
  if (!existsSync(srcPath)) {
    console.warn(`skip json (missing): ${srcPath}`);
    return;
  }
  const meta = JSON.parse(readFileSync(srcPath, "utf8"));
  const newSlug = `quaero-${baseSlug}`;
  const out = {
    ...meta,
    slug: newSlug,
    name: `Quaero — ${meta.name}`,
    tagline: `Quaero institutional chrome · ${meta.tagline}`,
    tone: Array.isArray(meta.tone)
      ? Array.from(new Set([...(meta.tone || []), "corporate", "institutional"]))
      : meta.tone,
  };
  if (typeof out.navigation === "string") {
    out.navigation = `${out.navigation} · Quaero chrome`;
  }
  writeFileSync(join(destDir, "template.json"), JSON.stringify(out, null, 2) + "\n", "utf8");
}

function main() {
  let errors = 0;
  const names = readdirSync(TEMPLATES_DIR).filter((n) => {
    const p = join(TEMPLATES_DIR, n);
    if (!isDir(p)) return false;
    if (n === "_quaero-shared") return false;
    if (n.startsWith("quaero-")) return false;
    return true;
  });

  mkdirSync(join(TEMPLATES_DIR, "_quaero-shared"), { recursive: true });

  for (const slug of names) {
    const src = join(TEMPLATES_DIR, slug);
    const dest = join(TEMPLATES_DIR, `quaero-${slug}`);

    rmSync(dest, { recursive: true, force: true });
    cpSync(src, dest, { recursive: true });

    const htmlPath = join(dest, "template.html");
    if (!existsSync(htmlPath)) {
      console.warn(`skip (no template.html): ${slug}`);
      rmSync(dest, { recursive: true, force: true });
      continue;
    }

    const override = OVERRIDES[slug] || {};
    let html = readFileSync(htmlPath, "utf8");
    try {
      html = injectIntoHtml(html, override, slug);
    } catch (e) {
      console.error(`FAIL ${slug}:`, e.message);
      errors++;
      rmSync(dest, { recursive: true, force: true });
      continue;
    }
    writeFileSync(htmlPath, html, "utf8");

    patchTemplateJson(src, dest, slug);
    console.log("built", `quaero-${slug}`);
  }
  if (errors) process.exitCode = 1;
}

main();
