# Vite

### manifest-declares-side-effects · SHOULD
The application's `package.json` declares `sideEffects` — `false`, or the files that have them, such as stylesheets — so the bundler drops what a surface re-exports and nothing uses.

| Why | Tags |
|---|---|
| a surface re-exports a folder whole; without the declaration the bundler keeps every module it could reach. | [] |
