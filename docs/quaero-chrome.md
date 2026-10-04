# Quaero header and footer

Keep the shared header, page counter, logo, and confidentiality footer.
Keep their assets in the delivered folder. The exported package uses paths
inside `assets/`; do not replace them with paths into the source repository.

The source variants are generated from base templates. Change the base design
or `scripts/build-quaero-variants.mjs`, then rebuild. Keep the hand-authored
`quaero-institutional` template separate.

Do not duplicate native counters behind the Quaero counter. For a new template,
check native navigation selectors before adding an override to the generator.
Check the header and footer on light and dark slides, after navigation, and
after resize. The content must remain outside their visible regions.

If source content requires a different confidentiality label, use the user's
approved label. Preserve the logo's aspect ratio.
