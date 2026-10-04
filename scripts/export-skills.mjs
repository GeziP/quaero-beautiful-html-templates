#!/usr/bin/env node
/**
 * Export every template in templates/ as an html-anything–compatible skill folder.
 *
 * Output goes to dist/skills/<slug>/ with:
 *   SKILL.md      — prompt body + frontmatter
 *   example.html  — our template.html, self-contained
 *   assets/       — deck-stage.js, styles.css, etc.
 *
 * Run: node scripts/export-skills.mjs
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, statSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageHtml } from './lib/package-assets.mjs';
import { skillBody } from './lib/skill-text.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const TEMPLATES_DIR = join(REPO_ROOT, 'templates');
const OUT_DIR = join(REPO_ROOT, 'dist', 'skills');

function isDir(p) {
  try { return statSync(p).isDirectory(); } catch { return false; }
}

function inferScenario(meta) {
  const text = `${meta.best_for} ${meta.mood?.join(' ')} ${meta.occasion?.join(' ')}`.toLowerCase();
  if (/pitch|investor|startup|accelerator/.test(text)) return 'sale';
  if (/research|academic|policy|white paper/.test(text)) return 'product';
  if (/fashion|brand|editorial|magazine|creative|design/.test(text)) return 'design';
  if (/marketing|campaign|launch/.test(text)) return 'marketing';
  if (/技术|engineering|technical/.test(text)) return 'engineering';
  if (/finance|advisory|consulting/.test(text)) return 'finance';
  return 'personal';
}

function buildFrontmatter(meta) {
  const skillName = `deck-${meta.slug}`;

  return [
    '---',
    `name: ${skillName}`,
    `zh_name: ${JSON.stringify(meta.name)}`,
    `en_name: ${JSON.stringify(meta.name)}`,
    `emoji: "🎴"`,
    `description: ${JSON.stringify('Create or edit an HTML presentation in the ' + meta.name + ' style. ' + meta.tagline)}`,
    `mode: deck`,
    `scenario: ${inferScenario(meta)}`,
    `surface: "1920x1080"`,
    `aspect_hint: "16:9"`,
    `tags: [${['deck', ...(meta.slug.startsWith('quaero-') ? ['quaero'] : []), meta.scheme, ...meta.mood.slice(0, 3)].map(t => `"${t}"`).join(', ')}]`,
    `preview:`,
    `  type: deck`,
    `design_system:`,
    `  requires: required`,
    `featured: false`,
    `example_prompt: |`,
    `  Create a ${meta.slide_count}-slide deck about [topic]. Use the ${meta.name} design system —`,
    `  ${meta.tagline.toLowerCase()} The deck should feel ${meta.mood.slice(0, 3).join(', ')}.`,
    `  Include a cover slide, table of contents, 3-4 content slides with data, and a closing slide.`,
    '---',
  ].join('\n');
}

// --- main ---

// OUT_DIR is a fixed child of this repository, never a user-provided path.
if (dirname(dirname(OUT_DIR)) !== REPO_ROOT) throw new Error('Unsafe output directory');
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const slugs = readdirSync(TEMPLATES_DIR).filter(name => {
  if (name === '_quaero-shared') return false;
  return isDir(join(TEMPLATES_DIR, name));
});

let exported = 0;
let errors = 0;

for (const slug of slugs) {
  const srcDir = join(TEMPLATES_DIR, slug);
  const metaPath = join(srcDir, 'template.json');

  if (!existsSync(metaPath)) {
    console.error(`  SKIP ${slug}: no template.json`);
    errors++;
    continue;
  }

  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  const skillSlug = `deck-${slug}`;

  const outDir = join(OUT_DIR, skillSlug);
  mkdirSync(outDir, { recursive: true });
  mkdirSync(join(outDir, 'assets'), { recursive: true });

  // 1. Generate SKILL.md
  const html = readFileSync(join(srcDir, 'template.html'), 'utf8');
  const runtime = /<deck-stage\b/i.test(html) ? 'deck-stage' : 'inline';
  const skillMd = buildFrontmatter(meta) + '\n\n' + skillBody(meta, runtime);
  writeFileSync(join(outDir, 'SKILL.md'), skillMd, 'utf8');

  const refsDir = join(outDir, 'references');
  mkdirSync(refsDir, { recursive: true });
  const designPath = join(srcDir, 'design.md');
  if (!existsSync(designPath)) throw new Error(`${slug}: missing design.md`);
  copyFileSync(designPath, join(refsDir, 'design.md'));
  for (const name of ['content-and-cjk.md', 'quaero-chrome.md', 'verification.md']) {
    copyFileSync(join(REPO_ROOT, 'docs', name), join(refsDir, name));
  }

  // Copy each referenced dependency and rewrite HTML references into assets/.
  const htmlPath = join(srcDir, 'template.html');
  try {
    const dependencies = packageHtml(htmlPath, join(outDir, 'example.html'), REPO_ROOT);
    writeFileSync(join(outDir, 'manifest.json'), JSON.stringify({ slug, dependencies }, null, 2) + '\n');
  } catch (error) {
    console.error(`  FAIL ${slug}: ${error.message}`);
    errors++;
    continue;
  }

  exported++;
  console.log(`  ✓ ${skillSlug}`);
}

console.log(`\nExported ${exported} skills to ${OUT_DIR}`);
if (errors) console.log(`  (${errors} skipped due to errors)`);

if (errors) process.exitCode = 1;
