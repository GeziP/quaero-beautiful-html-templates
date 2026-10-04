---
version: alpha
name: Quaero Institutional
description: Warm editorial institutional slides with a fixed Quaero header and confidentiality footer.
---

# Quaero Institutional

Use the HTML as the source for exact sizes, variables, and component structure.
The palette combines cream paper, dark brown ink, dusty pink, chartreuse, and
soft peach. Keep the declared CSS variables rather than introducing new colors.

The Latin display font is Cormorant Garamond. Work Sans carries body text.
IBM Plex Mono carries metadata. Noto Sans SC carries Chinese text.
All are declared by the template's existing Google Fonts import.

Keep the existing deck-stage navigation and its packaged script.
Preserve the custom header, page count, Quaero logo, and confidentiality footer.
Use the existing cards, borders, and spacing when adding slides.
Check long titles and data tables against the header and footer safe regions.

## CJK & International Content

Use Noto Sans SC for Chinese display and body text. Keep Latin metadata in
IBM Plex Mono. Use zero letter spacing and normal text transform for Chinese.
Allow balanced line breaks for long titles. Check the actual loaded font before
changing sizes to compensate for fallback rendering.
