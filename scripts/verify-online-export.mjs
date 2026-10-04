// Optional network-dependent acceptance check. The deterministic CI suite does
// not depend on Google Fonts/CDN availability.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname, extname, relative } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const served = join(root, 'dist/skills');
const artifacts = join(root, 'artifacts');
mkdirSync(artifacts, { recursive: true });
const server = createServer((req, res) => {
  const path = resolve(served, '.' + decodeURIComponent(req.url.split('?')[0]));
  if (relative(served, path).startsWith('..') || !existsSync(path)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': { '.js':'application/javascript', '.css':'text/css', '.png':'image/png', '.svg':'image/svg+xml', '.html':'text/html' }[extname(path)] || 'application/octet-stream' });
  res.end(readFileSync(path));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
const report = { template: 'quaero-editorial-forest', errors: [] };
try {
  browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
  const page = await browser.newPage({ viewport: { width:1280, height:720 } });
  await page.goto(`http://127.0.0.1:${server.address().port}/deck-${report.template}/example.html`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  report.fontsLoaded = await page.evaluate(() => [...document.fonts].some(font => font.family.replaceAll('"','') === 'Source Serif 4' && font.status === 'loaded'));
  assert.ok(report.fontsLoaded, 'real web font loaded');
  await page.screenshot({ path: join(artifacts, 'online-quaero-editorial-forest.png') });
  console.log('Bundling the real template, including its fonts');
  const html = await page.evaluate(() => QuaeroExport.standaloneHtml());
  const path = join(artifacts, 'standalone-quaero-editorial-forest.html');
  writeFileSync(path, html);
  report.standaloneBytes = Buffer.byteLength(html);
  const offline = await browser.newContext({ offline: true, viewport:{ width:1280,height:720 } });
  const replay = await offline.newPage();
  replay.on('pageerror', error => report.errors.push(error.message));
  replay.on('request', request => { if (/^https?:/.test(request.url())) report.errors.push('Offline file requested network: ' + request.url()); });
  await replay.goto(pathToFileURL(path).href);
  await replay.evaluate(() => document.fonts.ready);
  await replay.waitForTimeout(1200);
  await replay.keyboard.press('ArrowRight');
  await replay.waitForTimeout(1200);
  report.offlineIndex = await replay.evaluate(() => QuaeroExport.slides().indexOf(QuaeroExport.currentSlide()));
  assert.equal(report.offlineIndex, 1);
  report.offlineFontLoaded = await replay.evaluate(() => [...document.fonts].some(font => font.family.replaceAll('"','') === 'Source Serif 4' && font.status === 'loaded'));
  assert.ok(report.offlineFontLoaded);
  assert.deepEqual(report.errors, []);
  await replay.screenshot({ path: join(artifacts, 'offline-quaero-editorial-forest.png') });
  const bytes = await replay.evaluate(async () => Array.from(new Uint8Array(await (await QuaeroExport.captureSlide(QuaeroExport.currentSlide())).arrayBuffer())));
  writeFileSync(join(artifacts, 'real-deck-export.png'), Buffer.from(bytes));
  report.pngBytes = bytes.length;
  report.passed = true;
  console.log(`Real template passed offline replay and PNG export (${report.standaloneBytes} HTML bytes).`);
} catch (error) { report.passed = false; report.errors.push(error.message); process.exitCode = 1; }
finally {
  if (browser) await browser.close();
  server.close();
  writeFileSync(join(artifacts, 'online-export-report.json'), JSON.stringify(report, null, 2) + '\n');
}
