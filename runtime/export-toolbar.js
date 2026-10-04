/**
 * <export-toolbar> — drop-in export toolbar for Quaero HTML decks.
 *
 * Add <script src="export-toolbar.js"></script> to any deck and an
 * export button appears in the bottom-right corner.
 *
 * Capabilities:
 *   1. Copy for WeChat MP — inlines all CSS with juice-like logic so
 *      styles survive the WeChat editor paste.
 *   2. Download .html — self-contained single file.
 *   3. Download .png — captures current slide as a 2x retina PNG.
 *   4. Copy as image — puts a PNG on the clipboard for X / XHS / Weibo.
 *
 * Zero dependencies. Works in any modern browser (Chrome 90+, Safari 15+, Firefox 100+).
 */

(function () {
  'use strict';

  const TOOLBAR_ID = 'quaero-export-toolbar';
  if (document.getElementById(TOOLBAR_ID)) return;

  // --- CSS inliner (lightweight juice alternative) ---

  function inlineStyles(rootEl) {
    const clone = rootEl.cloneNode(true);
    const origEls = rootEl.querySelectorAll('*');
    const cloneEls = clone.querySelectorAll('*');

    for (let i = 0; i < origEls.length; i++) {
      const computed = window.getComputedStyle(origEls[i]);
      const dominated = [
        'font-family', 'font-size', 'font-weight', 'font-style',
        'line-height', 'letter-spacing', 'text-align', 'text-transform',
        'color', 'background-color', 'background',
        'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'border', 'border-radius',
        'display', 'position', 'width', 'height', 'max-width',
        'flex-direction', 'justify-content', 'align-items', 'gap',
        'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row',
        'opacity', 'overflow', 'white-space', 'word-break',
        'box-shadow', 'text-shadow',
      ];
      let style = '';
      for (const prop of dominated) {
        const val = computed.getPropertyValue(prop);
        if (val && val !== 'initial' && val !== 'none' && val !== 'normal' && val !== 'auto') {
          style += `${prop}:${val};`;
        }
      }
      cloneEls[i].setAttribute('style', style);
    }
    return clone;
  }

  // --- Screenshot via native canvas ---

  async function captureSlideAsPng(slideEl, scale = 2) {
    return window.QuaeroExport.captureSlide(slideEl, scale);
  }

  // --- WeChat copy ---

  async function copyForWechat() {
    const slides = window.QuaeroExport.slides();
    if (!slides.length) return showToast('No slides found');

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'max-width:600px;margin:0 auto;';

    for (const slide of slides) {
      const inlined = inlineStyles(slide);
      inlined.style.cssText += 'position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;margin-bottom:16px;page-break-after:always;';
      inlined.removeAttribute('class');
      wrapper.appendChild(inlined);
    }

    const html = wrapper.outerHTML;

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html], { type: 'text/plain' }),
        })
      ]);
      showToast('Copied HTML. Check layout and images in the WeChat editor.');
    } catch {
      return showToast('Rich HTML clipboard unavailable. Use PNG download.');

    }
  }

  // --- Download HTML ---

  async function downloadHtml() {
    const html = await window.QuaeroExport.standaloneHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (document.title || 'deck') + '.html';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('Downloaded .html');
  }

  // --- Download PNG / Copy as image ---

  function getCurrentSlide() {
    return window.QuaeroExport.currentSlide();
  }

  async function downloadPng() {
    const slide = getCurrentSlide();
    if (!slide) return showToast('No visible slide found');
    try {
      const blob = await captureSlideAsPng(slide);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.title || 'slide'}-${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('Downloaded .png');
    } catch (e) {
      showToast('PNG export failed: ' + e.message);
    }
  }

  async function copyAsImage() {
    const slide = getCurrentSlide();
    if (!slide) return showToast('No visible slide found');
    try {
      const blob = await captureSlideAsPng(slide);
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      showToast('Image copied — paste into X / XHS / Weibo');
    } catch (e) {
      showToast('Copy failed: ' + e.message);
    }
  }

  // --- Toast ---

  function showToast(msg) {
    let toast = document.getElementById('quaero-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'quaero-toast';
      toast.setAttribute('role', 'status');
      toast.style.cssText = `
        position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
        background:rgba(0,0,0,0.85); color:#fff; padding:10px 24px;
        border-radius:8px; font:14px/1.4 system-ui,sans-serif;
        z-index:99999; opacity:0; transition:opacity 0.3s;
        pointer-events:none; white-space:nowrap;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2400);
  }

  // --- Build toolbar UI ---

  function buildToolbar() {
    const bar = document.createElement('div');
    bar.id = TOOLBAR_ID;
    bar.innerHTML = `
      <style>
        #${TOOLBAR_ID} {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 99998;
          display: flex;
          gap: 6px;
          opacity: 0.35;
          transition: opacity 0.25s;
        }
        #${TOOLBAR_ID}:hover { opacity: 1; }
        #${TOOLBAR_ID} button {
          background: rgba(0,0,0,0.75);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          font: 13px/1 system-ui, sans-serif;
          cursor: pointer;
          white-space: nowrap;
          backdrop-filter: blur(8px);
          transition: background 0.15s;
        }
        #${TOOLBAR_ID} button:hover { background: rgba(0,0,0,0.92); }
        @media print { #${TOOLBAR_ID} { display: none !important; } }
      </style>
      <button data-action="wechat" title="Copy inlined HTML for WeChat MP">WeChat</button>
      <button data-action="image" title="Copy current slide as PNG">Copy IMG</button>
      <button data-action="png" title="Download current slide as 2x PNG">PNG</button>
      <button data-action="html" title="Download full deck as .html">HTML</button>
    `;

    bar.addEventListener('click', async (e) => {
      const action = e.target.dataset?.action;
      if (!action) return;
      const buttons = bar.querySelectorAll('button');
      buttons.forEach(button => { button.disabled = true; });
      try {
      switch (action) {
        case 'wechat': await copyForWechat(); break;
        case 'image':  await copyAsImage(); break;
        case 'png':    await downloadPng(); break;
        case 'html':   await downloadHtml(); break;
      }
      } catch (error) {
        showToast('Export failed: ' + error.message + '. Serve the deck over localhost for resource bundling.');
      } finally { buttons.forEach(button => { button.disabled = false; }); }
    });

    document.body.appendChild(bar);
  }

  // --- Init ---

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildToolbar);
  } else {
    buildToolbar();
  }
})();
