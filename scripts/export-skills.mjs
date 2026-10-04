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

import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageHtml } from './lib/package-assets.mjs';

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
    `description: ${JSON.stringify(meta.tagline)}`,
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

function buildPaletteConstraints(palette) {
  if (!palette) return '- No palette metadata available — follow the example.html colors exactly.';
  const lines = [];
  for (const [key, val] of Object.entries(palette)) {
    if (key === 'description') continue;
    lines.push(`  - \`--${key}\`: \`${val}\``);
  }
  return [
    `- **Color palette (CSS variables, mandatory):**`,
    ...lines,
    `- Palette description: ${palette.description || 'see example.html'}`,
    `- Never introduce new colors. If a layout needs a tint, derive it from these variables with opacity.`,
  ].join('\n');
}

function buildTypographyConstraints(typo) {
  if (!typo) return '- No typography metadata — follow example.html fonts exactly.';
  const lines = [`- **Typography (locked, never substitute):**`];
  if (typo.display) lines.push(`  - Display / headlines: \`${typo.display}\``);
  if (typo.body)    lines.push(`  - Body text: \`${typo.body}\``);
  if (typo.mono)    lines.push(`  - Monospace / captions: \`${typo.mono}\``);
  if (typo.cn)      lines.push(`  - CJK fallback: \`${typo.cn}\``);
  if (typo.style)   lines.push(`  - Style note: ${typo.style}`);
  return lines.join('\n');
}

function buildSkillBody(meta) {
  return `
# ${meta.name} — Quaero Deck Skill

${meta.tagline}

This is a **locked design system** — a complete visual identity with pre-defined fonts, palette,
decorative vocabulary, spacing, and chrome. The agent's job is to **fill in content**, not redesign.
Every slide must look like it belongs in the same deck as the \`example.html\`.

## Identity

- **Mood:** ${meta.mood.join(', ')}
- **Tone:** ${meta.tone.join(', ')}
- **Formality:** ${meta.formality}
- **Density:** ${meta.density}
- **Scheme:** ${meta.scheme}
- **Best for:** ${meta.best_for}
- **Avoid for:** ${meta.avoid_for}

## Hard constraints

${buildPaletteConstraints(meta.palette)}

${buildTypographyConstraints(meta.typography)}

- **8 px baseline rhythm.** All spacing, padding, margin, line-height should be multiples of 8 px.
- **Color contrast ≥ 4.5** for all text on background combinations.
- **No lorem ipsum.** Use the user's real data. No invented metrics, no placeholder names.
- **No pure black (#000) or pure white (#FFF)** unless the design system explicitly uses them.
- **Navigation:** ${meta.navigation || 'deck-stage.js runtime — arrow keys, space, PgUp/PgDn, Home/End'}.
  The \`<deck-stage>\` web component handles all keyboard nav, scaling, and print. Include it via
  \`<script src="deck-stage.js"></script>\` in the \`<head>\`. Slides are \`<section class="slide">\`
  children of \`<deck-stage>\`.

## Layout rules

- **Slide count:** The example has ${meta.slide_count} slides. Match the user's content volume —
  duplicate existing layouts to add more, drop from the bottom to reduce.
- **Preserve all decorative elements** — corner marks, grain overlays, geometric shapes, SVG ornaments.
  They are part of the identity, not optional decoration.
- **Preserve the grid structure** — column count, absolute positioning, flex hierarchies.
- **Preserve slide-level CSS classes** (e.g. \`.slide--cover\`, \`.s-toc\`, \`.layout-*\`).
- **Page numbers** follow the template's format. Update counts when adding/removing slides.

## What "good" looks like

- Opens the example.html, reads the design system, produces a new deck that is visually indistinguishable in style.
- Every slide uses the same fonts, palette, spacing, and decorative vocabulary as the example.
- New layouts (if the user needs a table, chart, or comparison the example doesn't have) are designed using the existing design system — same fonts, same colors, same decorative vocabulary.

## What "bad" looks like

- Substituting fonts ("Inter is similar enough" — no, \`${meta.typography?.display || 'the template font'}\` is the design system).
- Recoloring ("let's use blue instead" — no, the palette is locked).
- Stripping decorative elements ("they're just noise" — no, they are the identity).
- Mixing layouts from a different template.
- Using generic CSS instead of the template's established classes and variables.
`.trim();
}

// --- main ---

if (existsSync(OUT_DIR)) {
  console.log(`Cleaning ${OUT_DIR}...`);
  // We just overwrite — no recursive rm needed
}
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
  const skillMd = buildFrontmatter(meta) + '\n\n' + buildSkillBody(meta) + '\n';
  writeFileSync(join(outDir, 'SKILL.md'), skillMd, 'utf8');

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
