# Content and Chinese typography

Preserve the source's numbers, units, conditions, exceptions, and confidence.
For example, keep “may improve” conditional. Do not rewrite it as “improves”.
If content is missing, ask for it or label the omission. Do not invent results.

Use short, explicit instructions in Agent documents. Put one action in each
instruction. Define a technical term once, then use the same term consistently.
These clarity rules apply to instructions. Creative presentation copy can retain
the user's voice.

For Chinese text, read the selected template's `design.md` section named
“CJK & International Content”. Follow its family, weight, and loading guidance.
Do not guess an npm font package from a font name. Check the provided URL.
If the network blocks a font, report it and use an agreed local font.

Where the template has no CJK specification, use its declared Chinese font.
For Institutional, use Noto Sans SC from the existing Google Fonts import.
Keep Latin labels and page numbers in the template's Latin font.
Use zero letter spacing and normal text transform for Chinese prose.
Avoid changing font families within one Chinese sentence.
Use the template's documented Chinese line height and punctuation.

Reflow long Chinese titles. Keep the original hierarchy and safe margins.
Shorten text only when its meaning remains intact. If it still does not fit,
use another layout or another slide from the same visual system.

Example: a long Chinese title can use two balanced lines instead of reducing
every heading to the body-text size. A comparison table can reuse the selected
template's cards, borders, labels, and accent colors.
