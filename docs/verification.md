# Deck acceptance checks

Serve the output folder over localhost when testing resource bundling.
Run `python -m http.server 8000` from that folder, or use another local server.
Open the HTML entry point in a browser.

1. Check that local assets load without missing requests or script errors.
2. Check forward and backward navigation and the current page number.
3. Check every slide for missing content, clipped text, and unintended overlap.
4. Check Chinese title wrapping, font weights, and fallback fonts.
5. Check Quaero header, footer, and logo after resize.
6. Export a PNG from a content slide. Open it and check its visible content.
7. Download standalone HTML. Open it with network access disabled.
8. Confirm that sources, numbers, units, conditions, and qualifiers match the input.

Resource bundling fails if a required remote asset cannot be fetched. Fix the
asset URL or provide a local asset. Do not report a partial file as standalone.
Clipboard export depends on the browser and its permissions. WeChat can alter
pasted layouts and images. Check the pasted result in the target editor before
claiming compatibility. This repository's checks do not automate that editor.

PNG rendering uses SVG foreignObject. Check pseudo-elements, filters, animations,
and font rendering in the exported image. A browser screenshot can provide a
fallback when a browser cannot render a particular effect.
