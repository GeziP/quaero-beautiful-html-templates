/** Resource bundling and slide selection shared by the export toolbar. */
(function () {
  'use strict';
  const cache = new Map();
  function slides() { return Array.from(document.querySelectorAll('section.slide, div.slide')); }
  function currentSlide() {
    const all = slides();
    const stage = document.querySelector('deck-stage');
    if (stage && Number.isInteger(stage.index)) return all[stage.index] || null;
    const active = all.find(el => el.classList.contains('is-active') || el.classList.contains('active'));
    if (active) return active;
    return all.map(el => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const area = cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0' ? 0 :
        Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) *
        Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
      return { el, area };
    }).sort((a, b) => b.area - a.area)[0]?.el || null;
  }
  async function resource(url, kind = 'data') {
    const absolute = new URL(url, document.baseURI).href;
    const key = kind + absolute;
    if (!cache.has(key)) cache.set(key, (async () => {
      const response = await fetch(absolute);
      if (!response.ok) throw new Error(`Cannot bundle ${absolute}: HTTP ${response.status}`);
      if (kind === 'text') return response.text();
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(`Cannot read ${absolute}`));
        reader.readAsDataURL(blob);
      });
    })().catch(error => { cache.delete(key); throw error; }));
    return cache.get(key);
  }
  async function replaceAsync(text, pattern, replace) {
    const matches = Array.from(text.matchAll(pattern));
    const values = await Promise.all(matches.map(replace));
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i];
      text = text.slice(0, m.index) + values[i] + text.slice(m.index + m[0].length);
    }
    return text;
  }
  async function bundleCss(css, base, ancestors = []) {
    css = await replaceAsync(css, /@import\s+(?:url\(\s*)?['"]([^'"]+)['"]\s*\)?\s*([^;]*);/gi, async m => {
      const url = new URL(m[1], base).href;
      if (ancestors.includes(url)) throw new Error(`CSS import cycle: ${url}`);
      const body = await bundleCss(await resource(url, 'text'), url, [...ancestors, url]);
      return m[2].trim() ? `@media ${m[2]} {${body}}` : body;
    });
    return replaceAsync(css, /url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)/gi, async m => {
      const value = m[1] ?? m[2] ?? m[3];
      if (/^(data:|#)/i.test(value)) return m[0];
      return `url("${await resource(new URL(value, base).href)}")`;
    });
  }
  async function standaloneHtml() {
    const clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('#quaero-export-toolbar, #quaero-toast').forEach(el => el.remove());
    for (const script of clone.querySelectorAll('script[src]')) {
      const source = await resource(script.getAttribute('src'), 'text');
      script.removeAttribute('src');
      script.textContent = source.replace(/<\/script/gi, '<\\/script');
      script.removeAttribute('integrity');
      script.removeAttribute('crossorigin');
    }
    for (const link of clone.querySelectorAll('link[rel="stylesheet"]')) {
      const url = new URL(link.getAttribute('href'), document.baseURI).href;
      const style = document.createElement('style');
      style.textContent = await bundleCss(await resource(url, 'text'), url);
      if (link.media) style.media = link.media;
      link.replaceWith(style);
    }
    for (const style of clone.querySelectorAll('style')) {
      style.textContent = (await bundleCss(style.textContent, document.baseURI)).replace(/<\/style/gi, '<\\/style');
    }
    for (const el of clone.querySelectorAll('[style]')) {
      el.setAttribute('style', await bundleCss(el.getAttribute('style'), document.baseURI));
    }
    for (const el of clone.querySelectorAll('img[src], source[src], video[src], audio[src], video[poster], image[href]')) {
      for (const attr of ['src', 'poster', 'href']) {
        const value = el.getAttribute(attr);
        if (value && !/^(data:|#)/i.test(value)) el.setAttribute(attr, await resource(value));
      }
    }
    for (const el of clone.querySelectorAll('[srcset]')) {
      const value = el.getAttribute('srcset');
      if (/data:/i.test(value)) throw new Error('Data URL srcset is not supported');
      el.setAttribute('srcset', (await Promise.all(value.split(',').map(async item => {
        const [url, descriptor] = item.trim().split(/\s+/, 2);
        return `${await resource(url)}${descriptor ? ' ' + descriptor : ''}`;
      }))).join(', '));
    }
    clone.querySelectorAll('link[rel="preconnect"], link[rel="dns-prefetch"], base').forEach(el => el.remove());
    return '<!doctype html>\n' + clone.outerHTML;
  }
  async function fontCss() {
    const bodies = [];
    for (const sheet of document.styleSheets) {
      let css;
      try { css = Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n'); }
      catch { if (sheet.href) css = await resource(sheet.href, 'text'); }
      if (css) {
        const faces = css.match(/@font-face\s*\{[^}]*\}/gi) || [];
        bodies.push(await bundleCss(faces.join('\n'), sheet.href || document.baseURI));
      }
    }
    return bodies.join('\n');
  }
  async function styledClone(element) {
    const copy = element.cloneNode(true);
    const originals = [element, ...element.querySelectorAll('*')];
    const copies = [copy, ...copy.querySelectorAll('*')];
    await Promise.all(originals.map(async (original, i) => {
      const computed = getComputedStyle(original);
      let css = '';
      for (const name of computed) css += `${name}:${computed.getPropertyValue(name)};`;
      copies[i].setAttribute('style', await bundleCss(css, document.baseURI));
      if (copies[i].tagName === 'IMG' && original.currentSrc) {
        copies[i].src = await resource(original.currentSrc);
        copies[i].removeAttribute('srcset');
      }
    }));
    copy.style.cssText += ';transform:none;margin:0;position:relative;left:0;top:0;opacity:1;visibility:visible;';
    return copy;
  }
  async function captureSlide(element, scale = 2) {
    await document.fonts.ready;
    const r = element.getBoundingClientRect();
    const width = element.offsetWidth || Math.round(r.width);
    const height = element.offsetHeight || Math.round(r.height);
    if (!width || !height) throw new Error('Slide has no dimensions');
    const copy = await styledClone(element);
    copy.style.width = `${width}px`;
    copy.style.height = `${height}px`;
    const wrapper = document.createElement('div');
    wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    wrapper.style.cssText = `position:relative;width:${width}px;height:${height}px;overflow:hidden;`;
    wrapper.append(copy);
    for (const chrome of document.querySelectorAll('.qhi-header, .quaero-footer')) {
      const c = await styledClone(chrome);
      const cr = chrome.getBoundingClientRect();
      const sx = width / r.width;
      const sy = height / r.height;
      c.style.position = 'absolute';
      c.style.left = `${(cr.left - r.left) * sx}px`;
      c.style.top = `${(cr.top - r.top) * sy}px`;
      c.style.transform = `scale(${sx},${sy})`;
      c.style.transformOrigin = 'top left';
      wrapper.append(c);
    }
    const fonts = document.createElement('style');
    fonts.textContent = await fontCss();
    wrapper.prepend(fonts);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(wrapper)}</foreignObject></svg>`;
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = () => reject(new Error('SVG image rendering failed')); });
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG encoding failed')), 'image/png'));
  }
  window.QuaeroExport = Object.freeze({ slides, currentSlide, standaloneHtml, captureSlide });
})();
