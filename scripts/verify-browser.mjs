import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname, join, extname, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifacts = join(root, 'artifacts');
mkdirSync(artifacts, { recursive: true });
// Serve only a relocated copy. No request can fall back to repository assets.
const temporary = mkdtempSync(join(tmpdir(), 'quaero-browser-'));
cpSync(join(root, 'dist/skills'), join(temporary, 'skills'), { recursive: true });
const fixture = join(temporary, 'fixture');
mkdirSync(join(fixture, 'nested'), { recursive: true });
writeFileSync(join(fixture, 'image.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#eb3366"/></svg>');
writeFileSync(join(fixture, 'nested/colors.css'), '.slide{background:#eee;color:#123}');
writeFileSync(join(fixture, 'style.css'), '@import "nested/colors.css"; .slide{width:640px;height:360px;font:32px Arial;overflow:hidden;position:relative;transform:scale(.5);transform-origin:top left} body{margin:0} .qhi-header{position:fixed;top:5px;left:5px;width:310px;height:15px;background:#123;color:white} .quaero-footer{position:fixed;top:165px;left:0;width:320px;height:15px;background:rgb(255,0,0)} .slide::after{content:"";position:absolute;right:0;bottom:30px;width:20px;height:20px;background:rgb(0,255,0)} .box{width:80px;height:80px;background:url("image.svg")}');
writeFileSync(join(fixture, 'nav.js'), 'window.fixtureLoaded=true;document.addEventListener("keydown",e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){document.querySelectorAll(".slide").forEach(el=>el.classList.toggle("active"));}});');
const core = readFileSync(join(root, 'runtime/export-core.js'), 'utf8');
const toolbar = readFileSync(join(root, 'runtime/export-toolbar.js'), 'utf8');
writeFileSync(join(fixture, 'core.js'), core);
writeFileSync(join(fixture, 'toolbar.js'), toolbar);
writeFileSync(join(fixture, 'index.html'), '<!doctype html><html><head><title>Export fixture</title><link rel="stylesheet" href="style.css"><style>.slide:not(.active){display:none}</style></head><body><section class="slide active"><h1>Export Test</h1><div class="box"></div><img src="image.svg"></section><section class="slide"><h1>Second slide</h1></section><div class="qhi-header">Header</div><div class="quaero-footer">Footer</div><script src="nav.js"></script><script src="core.js"></script><script src="toolbar.js"></script></body></html>');
const types = { '.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
const server = createServer((req, res) => {
  try {
    const path = resolve(temporary, '.' + decodeURIComponent(req.url.split('?')[0]));
    if (relative(temporary, path).startsWith('..') || !existsSync(path)) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' });
    res.end(readFileSync(path));
  } catch { res.writeHead(500); res.end('Read failed'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const launch = { headless: true };
if (process.env.BROWSER_CHANNEL) launch.channel = process.env.BROWSER_CHANNEL;
let browser;
const report = { browser: process.env.BROWSER_CHANNEL || 'chromium', relocated: true, templates: [], cjk: [], exports: {}, visualFindings: [], failures: [] };
const representatives = new Set(['pink-script','quaero-pink-script','studio','quaero-studio','editorial-forest','quaero-editorial-forest','quaero-institutional','pin-and-paper','quaero-pin-and-paper','emerald-editorial','quaero-emerald-editorial']);
try {
  browser = await chromium.launch(launch);
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  // Structural tests deliberately exclude network-dependent fonts. Online font
  // fidelity is reported separately, never inferred from these offline checks.
  await context.route('https://**', route => route.abort());
  const allMetas = JSON.parse(readFileSync(join(root, 'index.json'), 'utf8')).templates;
  const metas = process.env.VERIFY_SLUG ? allMetas.filter(meta => meta.slug === process.env.VERIFY_SLUG) : allMetas;
  let next = 0;
  async function worker() {
    const page = await context.newPage();
    let errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
    while (next < metas.length) {
      const meta = metas[next++];
      errors = [];
      try {
        await page.goto(`${base}/skills/deck-${meta.slug}/example.html`, { waitUntil: 'load' });
        await page.waitForTimeout(1100);
        const state = () => page.evaluate(() => ({ count: QuaeroExport.slides().length, index: QuaeroExport.slides().indexOf(QuaeroExport.currentSlide()) }));
        const first = await state();
        assert.equal(first.count, meta.slide_count, 'slide count');
        assert.equal(first.index, 0, 'initial slide');
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(1100);
        assert.equal((await state()).index, 1, 'forward navigation/current slide');
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(1100);
        assert.equal((await state()).index, 0, 'backward navigation/current slide');
        if (meta.slug.startsWith('quaero-')) {
          const pageLabel = await page.locator('#qhi-header-page').textContent();
          assert.ok(pageLabel.includes(String(meta.slide_count).padStart(2, '0')), 'Quaero total counter');
        }
        if (representatives.has(meta.slug)) {
          await page.screenshot({ path: join(artifacts, `${meta.slug}-cover.png`) });
          const findings = await page.evaluate(() => {
            const slide = QuaeroExport.currentSlide();
            const sr = slide.getBoundingClientRect();
            return [...slide.querySelectorAll('h1,h2,h3')].filter(el => {
              const r = el.getBoundingClientRect();
              const cs = getComputedStyle(el);
              return cs.visibility !== 'hidden' && cs.opacity !== '0' && (r.right > sr.right + 3 || r.bottom > sr.bottom + 3 || r.left < sr.left - 3 || r.top < sr.top - 3);
            }).map(el => ({ text: el.textContent.trim().slice(0, 80), issue: 'heading bounds extend outside slide; inspect screenshot' }));
          });
          report.visualFindings.push(...findings.map(f => ({ slug: meta.slug, ...f })));
          await page.setViewportSize({ width: 1440, height: 900 });
          await page.waitForTimeout(150);
          if (meta.slug.startsWith('quaero-')) {
            const chrome = await page.evaluate(() => [...document.querySelectorAll('.qhi-header,.quaero-footer')].map(el => { const r=el.getBoundingClientRect();return {width:r.width,height:r.height,top:r.top,bottom:r.bottom}; }));
            assert.ok(chrome.every(r => r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= 902), 'chrome viewport bounds');
          }
          await page.setViewportSize({ width: 1280, height: 720 });
          if (['pink-script', 'editorial-forest', 'quaero-institutional'].includes(meta.slug)) {
            const titleResult = await page.evaluate(() => {
              const slide = QuaeroExport.currentSlide();
              const title = slide.querySelector('h1,h2,.script,.cover-title,.title');
              if (!title) throw new Error('No title for CJK stress check');
              title.textContent = '跨市场研究与数据分析：年度趋势、风险判断及长期战略展望';
              const family = document.title.toLowerCase().includes('pink') ? 'Noto Serif SC' : 'Noto Sans SC';
              title.style.fontFamily = `"${family}", serif`;
              title.style.fontWeight = family === 'Noto Serif SC' ? '900' : '700';
              title.style.letterSpacing = '0';
              title.style.textTransform = 'none';
              title.style.lineHeight = '1.2';
              title.style.whiteSpace = 'normal';
              const sr = slide.getBoundingClientRect();
              title.style.maxWidth = `${slide.offsetWidth * .8}px`;
              let size = Math.min(128, parseFloat(getComputedStyle(title).fontSize));
              for (; size >= 32; size -= 4) {
                title.style.fontSize = `${size}px`;
                const r = title.getBoundingClientRect();
                if (r.right <= sr.right && r.bottom <= sr.bottom && r.left >= sr.left && r.top >= sr.top) break;
              }
              return { size, family, boundsFit: size >= 32, fontNetworkVerified: false };
            });
            assert.ok(titleResult.boundsFit, 'long CJK title fits after documented layout adjustment');
            report.cjk.push({ slug: meta.slug, ...titleResult });
            await page.screenshot({ path: join(artifacts, `${meta.slug}-cjk.png`) });
          }
        }
        assert.deepEqual(errors, [], 'local assets and JavaScript');
        report.templates.push({ slug: meta.slug, passed: true, slides: first.count });
      } catch (error) { report.templates.push({ slug: meta.slug, passed: false }); report.failures.push(`${meta.slug}: ${error.message}`); }
      if (report.templates.length % 10 === 0) console.log(`Checked ${report.templates.length}/${metas.length} relocated packages`);
    }
    await page.close();
  }
  await worker();
  const page = await context.newPage();
  await page.goto(`${base}/fixture/index.html`);
  const html = await page.evaluate(() => QuaeroExport.standaloneHtml());
  writeFileSync(join(artifacts, 'standalone-fixture.html'), html);
  assert.equal(await page.evaluate(html => new DOMParser().parseFromString(html,'text/html').querySelectorAll('script[src],link[rel="stylesheet"]').length, html), 0);
  assert.ok(html.includes('data:image/svg+xml'), 'images bundled');
  const offline = await browser.newContext({ offline: true, viewport: { width: 1280, height: 720 } });
  const offlinePage = await offline.newPage();
  let offlineErrors = [];
  offlinePage.on('pageerror', error => offlineErrors.push(error.message));
  await offlinePage.goto(pathToFileURL(join(artifacts, 'standalone-fixture.html')).href);
  assert.equal(await offlinePage.evaluate(() => window.fixtureLoaded), true);
  assert.equal(await offlinePage.locator('.box').evaluate(el => getComputedStyle(el).backgroundImage.startsWith('url("data:')), true);
  await offlinePage.keyboard.press('ArrowRight');
  assert.equal(await offlinePage.evaluate(() => QuaeroExport.slides().indexOf(QuaeroExport.currentSlide())), 1);
  assert.deepEqual(offlineErrors, []);
  await offlinePage.screenshot({ path: join(artifacts, 'standalone-offline.png') });
  report.exports.standaloneOffline = true;
  await offline.close();
  await page.waitForTimeout(100);
  const capture = await page.evaluate(async () => {
    const blob = await QuaeroExport.captureSlide(QuaeroExport.currentSlide());
    const image = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
    const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
    return { bytes: Array.from(new Uint8Array(await blob.arrayBuffer())), width:image.width,height:image.height,pixel:Array.from(ctx.getImageData(2,2,1,1).data),footer:Array.from(ctx.getImageData(image.width/2,image.height-5,1,1).data),pseudo:Array.from(ctx.getImageData(image.width-5,image.height-65,1,1).data) };
  });
  assert.equal(capture.width, 1280);assert.equal(capture.height,720);
  writeFileSync(join(artifacts, 'export-fixture.png'), Buffer.from(capture.bytes));
  assert.ok(capture.pixel[3] > 0, 'PNG is not transparent');
  assert.deepEqual(capture.footer,[255,0,0,255],'viewport chrome projects to the native slide footer');
  assert.equal(capture.pseudo[1],255,'pseudo-element decoration survives PNG export');
  report.exports.png = { width: capture.width, height: capture.height, bytes: capture.bytes.length };
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-action="png"]').click();
  const download = await downloadPromise;
  assert.equal(await download.failure(), null);
  report.exports.toolbarDownload = true;
  await page.evaluate(() => { const img=document.createElement('img');img.src='missing.png';document.body.append(img); });
  await assert.rejects(() => page.evaluate(() => QuaeroExport.standaloneHtml()), /HTTP 404/);
  report.exports.missingAssetFails = true;
  // Permission-denied clipboard must report failure, never plain-text success.
  await page.evaluate(() => Object.defineProperty(navigator,'clipboard',{configurable:true,value:{write:()=>Promise.reject(new Error('permission denied'))}}));
  await page.locator('[data-action="wechat"]').click();
  await page.waitForFunction(() => document.querySelector('#quaero-toast')?.textContent.includes('unavailable'));
  report.exports.clipboardDenial = true;
  await page.close();
  await context.close();
} catch (error) { report.failures.push(error.stack || error.message); }
finally {
  if (browser) await browser.close();
  server.close();
  rmSync(temporary, { recursive: true, force: true });
  writeFileSync(join(artifacts, 'browser-report.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(`${report.templates.filter(t => t.passed).length}/${report.templates.length} packages passed; ${report.failures.length} failures; ${report.visualFindings.length} visual findings.`);
if (report.failures.length) { console.error(report.failures.join('\n')); process.exitCode = 1; }
