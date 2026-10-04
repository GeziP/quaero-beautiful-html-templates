import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function build() {
  for (const script of ['build-quaero-variants', 'inject-export-toolbar', 'build-index', 'export-skills']) {
    execFileSync(process.execPath, [join(root, 'scripts', script + '.mjs')], { cwd: root, stdio: 'pipe' });
  }
}
function digest() {
  const hashes = {};
  function walk(path) {
    if (statSync(path).isDirectory()) for (const name of readdirSync(path).sort()) walk(join(path, name));
    else hashes[relative(root, path).replaceAll('\\', '/')] = createHash('sha256').update(readFileSync(path)).digest('hex');
  }
  for (const path of ['templates', 'index.json', 'dist/skills']) walk(join(root, path));
  return hashes;
}
build();
const first = digest();
build();
assert.deepEqual(digest(), first, 'Consecutive builds must produce the same files and bytes');
console.log(`Two builds produced identical hashes for ${Object.keys(first).length} files.`);
