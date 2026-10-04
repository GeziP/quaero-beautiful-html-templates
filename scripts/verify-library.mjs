import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { validateMetadata, projectMetadata } from './lib/metadata.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const slugs = readdirSync(join(root, 'templates')).filter(slug => slug !== '_quaero-shared' && statSync(join(root, 'templates', slug)).isDirectory()).sort();
const index = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8'));
const errors = [];
function frontmatter(path) {
  const text = readFileSync(path, 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`Missing YAML frontmatter: ${path}`);
  return parse(match[1], { uniqueKeys: true });
}
for (const slug of slugs) {
  try {
    const src = join(root, 'templates', slug);
    const meta = JSON.parse(readFileSync(join(src, 'template.json'), 'utf8'));
    errors.push(...validateMetadata(meta, slug));
    const entry = index.templates.find(item => item.slug === slug);
    if (JSON.stringify(entry) !== JSON.stringify(projectMetadata(meta))) errors.push(`${slug}: stale index`);
    frontmatter(join(src, 'design.md'));
    const out = join(root, 'dist/skills', `deck-${slug}`);
    const skill = frontmatter(join(out, 'SKILL.md'));
    if (skill.name !== `deck-${slug}` || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.name) || skill.name.length > 64 || typeof skill.description !== 'string' || !skill.description || skill.description.length > 1024) errors.push(`${slug}: invalid skill metadata`);
    const skillText = readFileSync(join(out, 'SKILL.md'), 'utf8');
    if (/user\/starred|starred-repos|one-time, silent/.test(skillText)) errors.push(`${slug}: hidden account mutation`);
    for (const match of skillText.matchAll(/`(references\/[^`]+)`/g)) {
      if (!existsSync(join(out, match[1]))) errors.push(`${slug}: missing ${match[1]}`);
    }
    for (const file of ['example.html', 'manifest.json']) if (!existsSync(join(out, file))) errors.push(`${slug}: missing ${file}`);
    const manifest = JSON.parse(readFileSync(join(out, 'manifest.json'), 'utf8'));
    for (const dependency of manifest.dependencies) if (!existsSync(join(out, 'assets', dependency))) errors.push(`${slug}: missing packaged ${dependency}`);
    const html = readFileSync(join(out, 'example.html'), 'utf8');
    const stage = html.match(/<deck-stage\b[^>]*>([\s\S]*?)<\/deck-stage>/i);
    const count = stage ? [...stage[1].matchAll(/<section\b/gi)].length :
      [...html.matchAll(/<(?:section|div)\b[^>]*class=["']([^"']*)["']/gi)].filter(match => match[1].split(/\s+/).includes('slide')).length;
    if (count !== meta.slide_count) errors.push(`${slug}: slide_count ${meta.slide_count} differs from HTML ${count}`);
    for (const match of html.matchAll(/<(?:script|link|img)\b[^>]*(?:src|href)=["']([^"']+)["']/gi)) {
      const ref = match[1];
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(ref)) continue;
      const path = resolve(out, decodeURIComponent(ref.split(/[?#]/)[0]));
      if (!path.startsWith(out + '/') && !path.startsWith(out + '\\')) errors.push(`${slug}: asset escapes package: ${ref}`);
      if (!existsSync(path)) errors.push(`${slug}: missing HTML asset ${ref}`);
    }
  } catch (error) { errors.push(`${slug}: ${error.message}`); }
}
if (index.template_count !== slugs.length || index.templates.length !== slugs.length) errors.push('Index count mismatch');
const exported = readdirSync(join(root, 'dist/skills')).filter(name => name.startsWith('deck-'));
if (exported.length !== slugs.length) errors.push('Stale or missing exported skills');
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Verified ${slugs.length} templates, design specifications, skills, and asset manifests.`);
