# TypeScript with package

## exports-map-each-entry · MUST
`exports` in `package.json` maps each entry of the package to its file, so a consumer reaches the package only through the entries it lists.
**Why:** a path `exports` does not map cannot be imported, so the curated entries are the whole of what a consumer can couple to.
**Check:** review
**Implements:** `package-entries-curated`
