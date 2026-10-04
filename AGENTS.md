# Quaero HTML presentation library

Use this library to choose a template and create a finished HTML deck.
For repository maintenance, follow the build and verification section below.
The deck workflow applies when the user requests a presentation.

## Deck workflow

1. Read the user's brief for audience, occasion, tone, language, and content.
2. Ask only for missing information that changes the template choice.
3. If the user chose a template, use it. Otherwise, read `index.json` and
   shortlist three distinct templates that match the requested tone.
4. Populate their covers with the user's title and subtitle. Keep required
   assets with each preview. Open the previews using the available browser or
   preview tool. Show their absolute paths and let the user choose.
5. Read the chosen `template.html` and relevant sections of `design.md`.
6. For Chinese text, read its CJK section and `docs/content-and-cjk.md`.
7. Copy the complete template and its referenced assets into the output folder.
   Prefer a generated `dist/skills/deck-<slug>/` package for portable delivery.
8. Replace demo text, figures, dates, authors, citations, and images.
9. Duplicate existing layouts when adding slides. Extend the same design system
   when a layout is missing. Remove slides that the content does not need.
10. Update labels and page counts. Follow `docs/verification.md` before delivery.
11. Open the result and provide its absolute HTML path and complete output folder.
    State any material failed or unverified checks.

Do not repeat questions that the user already answered. If the user requests
direct generation without previews, proceed with their stated preference.

## Matching and design constraints

Match `mood`, `tone`, and `best_for` to the user's requested feeling.
Use `formality` and `density` to check audience fit and content volume.
Use `scheme` when the user specifies a light or dark presentation.
Treat `occasion` as examples and `avoid_for` as guidance.
The user's explicit choices take precedence over those recommendations.

Preserve the palette, Latin fonts, layout grid, slide classes, decorations,
component structure, spacing, and actual navigation implementation.
Use documented CJK font adaptations for Chinese content.
For new layouts, reuse the selected template's hierarchy and visual vocabulary.
Do not import a different template's visual language without a user request.

Preserve source facts, units, conditions, uncertainty, and exceptions.
Do not invent data or citations. Ask for missing source material when needed.
Check contrast and readability. Explain changes that affect the visual identity.
For Quaero decks, follow `docs/quaero-chrome.md`.

## Build and verify the library

Base templates live in `templates/<slug>/`.
`quaero-*` variants are generated, except for `quaero-institutional`.
Edit their base template or the variant generator, then rebuild.
The Institutional template is maintained separately.

Run these commands from the repository root:

```sh
npm ci
npm run build
npm test
npm run verify
npm run verify:browser
```

Browser verification uses Playwright Chromium. Install it with
`npx playwright install chromium`, or set `BROWSER_CHANNEL=msedge` to use Edge.
For a reproducibility check, run the build twice and compare generated output.
Keep the source tree free of unexpected changes after the second build.

The browser checks record structural failures separately from visual findings.
Inspect recorded screenshots for design fidelity and Chinese typography.
The checks do not establish WeChat editor compatibility or Safari support.
Document those limits rather than claiming an untested export feature works.
