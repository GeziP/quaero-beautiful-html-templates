import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packageHtml } from '../scripts/lib/package-assets.mjs';

test('a relocated package retains sibling, shared, and nested CSS assets', () => {
  const root = mkdtempSync(join(tmpdir(), 'quaero-assets-'));
  try {
    mkdirSync(join(root, 'templates/demo'), { recursive: true });
    mkdirSync(join(root, 'runtime'), { recursive: true });
    writeFileSync(join(root, 'templates/demo/template.html'), '<link href="style.css" rel="stylesheet"><script src="../../runtime/a.js"></script>');
    writeFileSync(join(root, 'templates/demo/style.css'), 'p{background:url("image.svg")} i{background:url("data:image/svg+xml,<svg filter=\'url(%23n)\'/>")}');
    writeFileSync(join(root, 'templates/demo/image.svg'), '<svg/>');
    writeFileSync(join(root, 'runtime/a.js'), 'window.loaded=true');
    const out = join(root, 'out/example.html');
    const deps = packageHtml(join(root, 'templates/demo/template.html'), out, root);
    assert.equal(deps.length, 3);
    assert.ok(readFileSync(out, 'utf8').includes('assets/runtime/a.js'));
    assert.ok(existsSync(join(root, 'out/assets/templates/demo/image.svg')));
    assert.ok(readFileSync(join(root, 'out/assets/templates/demo/style.css'), 'utf8').includes('url(%23n)'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('missing and escaping assets fail the build', () => {
  const root = mkdtempSync(join(tmpdir(), 'quaero-invalid-'));
  try {
    const html = join(root, 'a.html');
    writeFileSync(html, '<script src="missing.js"></script>');
    assert.throws(() => packageHtml(html, join(root, 'out/example.html'), root), /Missing asset/);
    writeFileSync(html, '<script src="../outside.js"></script>');
    assert.throws(() => packageHtml(html, join(root, 'out/example.html'), root), /escapes repository/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
