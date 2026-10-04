#!/usr/bin/env node
/**
 * Injects (or updates) the export-toolbar.js script tag into every
 * templates/<slug>/template.html.
 *
 * The injected tag is:
 *   <script src="../../runtime/export-toolbar.js"></script>
 *
 * It's inserted right before </body> (or </html> as fallback).
 * If the tag already exists, the file is skipped.
 *
 * Run: node scripts/inject-export-toolbar.mjs
 *
 * Pass --remove to strip the toolbar from all templates instead.
 */

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const TEMPLATES_DIR = join(REPO_ROOT, 'templates');

const REMOVE_MODE = process.argv.includes('--remove');
const TAG = '<script src="../../runtime/export-core.js"></script>\n<script src="../../runtime/export-toolbar.js"></script>';
const TAG_PATTERN = /<script\s+src="[^"]*export-(?:toolbar|core)\.js"><\/script>\s*/g;

function isDir(p) {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

const slugs = readdirSync(TEMPLATES_DIR).filter(name => {
  if (name === '_quaero-shared') return false;
  return isDir(join(TEMPLATES_DIR, name));
});

let injected = 0;
let removed = 0;
let skipped = 0;

for (const slug of slugs) {
  const htmlPath = join(TEMPLATES_DIR, slug, 'template.html');
  if (!existsSync(htmlPath)) {
    skipped++;
    continue;
  }

  let html = readFileSync(htmlPath, 'utf8');

  if (REMOVE_MODE) {
    TAG_PATTERN.lastIndex = 0;
    if (TAG_PATTERN.test(html)) {
      html = html.replace(TAG_PATTERN, '');
      writeFileSync(htmlPath, html, 'utf8');
      removed++;
      console.log(`  - ${slug}`);
    } else {
      skipped++;
    }
    continue;
  }

  if (html.includes('export-toolbar.js') && html.includes('export-core.js')) {
    skipped++;
    continue;
  }

  html = html.replace(TAG_PATTERN, '');
  if (html.includes('</body>')) {
    html = html.replace('</body>', `${TAG}\n</body>`);
  } else if (html.includes('</html>')) {
    html = html.replace('</html>', `${TAG}\n</html>`);
  } else {
    html += `\n${TAG}\n`;
  }

  writeFileSync(htmlPath, html, 'utf8');
  injected++;
  console.log(`  + ${slug}`);
}

if (REMOVE_MODE) {
  console.log(`\nRemoved from ${removed} templates (${skipped} skipped).`);
} else {
  console.log(`\nInjected into ${injected} templates (${skipped} already had it or no HTML).`);
}
