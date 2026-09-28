# TypeScript with package

## manifest-exports-with-types-condition · SHOULD
`exports` in `package.json` maps each entry to its file, with a `types` condition beside `default` wherever a consumer imports code; `files` lists exactly what ships.
**Why:** a consumer's compiler finds the types of each entry, and nothing unlisted ships by accident.
**Check:** review
**Tags:** architecture
**Implements:** `package-entries-curated`
