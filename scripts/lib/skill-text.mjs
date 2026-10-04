export function skillBody(meta, runtime) {
  return `# ${meta.name}

Create an HTML presentation with this template's design system.
Read \`example.html\` to identify its layout and navigation.
Read \`references/design.md\` when changing a layout, font, or component.
For Chinese content, also read \`references/content-and-cjk.md\`.
For a Quaero deck, also read \`references/quaero-chrome.md\`.

## Workflow

1. Use the user's stated audience, occasion, tone, and content.
2. Ask only for missing information that changes the result.
3. If the user already chose this template, begin the deck.
4. Otherwise, show three populated cover previews for the user to choose.
5. Copy this entire folder to the output location. Keep the asset paths.
6. Replace demo content with supplied content. Preserve sources and qualifiers.
7. Reuse layouts for additional slides. Extend the same design system for missing layouts.
8. Update page numbers. Check the deck in a browser before delivery.

## Design constraints

- Preserve the template's colors, spacing, decoration, and component structure.
- Preserve the Latin fonts. Use the documented CJK fonts for Chinese text.
- Follow actual template spacing. Do not impose a new global spacing grid.
- ${runtime === 'deck-stage' ? 'Keep the existing deck-stage component and its packaged script.' : 'Keep the template\'s existing inline navigation. Do not add deck-stage.'}
- Keep headings and figures readable. Check overflow after replacing content.
- If an accessibility adjustment changes the palette, explain the change.
- Treat mood and use cases as guidance. The user's explicit design choices take precedence.
- Do not invent statistics, citations, names, or claims.
- Keep uncertainty, conditions, exceptions, units, and dates from the source.

## Delivery

Read \`references/verification.md\` for the acceptance checks.
Deliver the complete output folder and the absolute path to its HTML entry point.
Open the result with the available preview tool or browser.
Report failed checks and unverified export features.

## Template identity

- Mood: ${meta.mood.join(', ')}.
- Tone: ${meta.tone.join(', ')}.
- Scheme: ${meta.scheme}.
- Demo slide count: ${meta.slide_count}. Adapt the count to the user's content.
- Navigation implementation: ${runtime}.
`;
}
