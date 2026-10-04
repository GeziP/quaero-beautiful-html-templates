import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve, relative, join, sep } from 'node:path';

const remote = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i;
const slash = value => value.split(sep).join('/');

// Keep the original directory structure below assets/ so CSS dependencies retain
// their relative relationships. All HTML references point inside the package.
export function packageHtml(source, output, repoRoot) {
  const root = resolve(repoRoot);
  const copied = new Set();
  const dependencies = [];
  function reference(value, from, target) {
    if (!value || remote.test(value)) return value;
    const [path, suffix = ''] = value.split(/(?=[?#])/s, 2);
    const sourcePath = resolve(dirname(from), decodeURIComponent(path));
    const repoPath = relative(root, sourcePath);
    if (repoPath.startsWith('..') || resolve(sourcePath) === root) {
      throw new Error(`Asset escapes repository: ${value} in ${from}`);
    }
    if (!existsSync(sourcePath) || !statSync(sourcePath).isFile()) {
      throw new Error(`Missing asset: ${value} in ${from}`);
    }
    const destination = join(dirname(output), 'assets', repoPath);
    if (!copied.has(sourcePath)) {
      copied.add(sourcePath);
      dependencies.push(slash(repoPath));
      mkdirSync(dirname(destination), { recursive: true });
      let data = readFileSync(sourcePath);
      if (/\.css$/i.test(sourcePath)) {
        data = Buffer.from(rewriteCss(data.toString(), sourcePath, destination));
      }
      writeFileSync(destination, data);
    }
    return slash(relative(dirname(target), destination)) + suffix;
  }
  function rewriteCss(css, from, target) {
    return css.replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)/gi,
      (_, double, single, bare) => `url("${reference(double ?? single ?? bare, from, target)}")`)
      .replace(/@import\s+(['"])([^'"]+)\1/gi,
        (_, quote, value) => `@import "${reference(value, from, target)}"`);
  }
  let html = readFileSync(source, 'utf8');
  html = html.replace(/\b(src|href|poster)\s*=\s*(['"])(.*?)\2/gi,
    (_, attr, quote, value) => `${attr}=${quote}${reference(value, source, output)}${quote}`);
  html = html.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,
    (_, start, css, end) => start + rewriteCss(css, source, output) + end);
  html = html.replace(/\bstyle\s*=\s*(['"])(.*?)\1/gi,
    (_, quote, css) => `style=${quote}${rewriteCss(css, source, output).replaceAll(quote, quote === '"' ? '&quot;' : '&#39;')}${quote}`);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, html);
  return dependencies.sort();
}
