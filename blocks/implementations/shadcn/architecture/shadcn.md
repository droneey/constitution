# shadcn

## shadcn-source-adapted-on-arrival · MUST
shadcn source is added with its CLI into the UI kit, after the kit is searched for an equivalent — never imported from a package — and adapted before review: placed and named, restyled to tokens, stripped of unused props, its props conformed, its imports rewritten to the project's alias. `components.json` points the CLI at the kit's folders.
**Why:** code kept as it came carries another project's names and looks; adapted on arrival, it is the kit's own.
**Check:** review
**Tags:** ux, architecture
**Implements:** `vendored-components-adapted-on-arrival`
