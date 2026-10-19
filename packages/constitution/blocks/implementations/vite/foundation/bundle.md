# Bundle

> Governs what the bundler may drop.

## General

### manifest-declares-side-effects · SHOULD

The application's `package.json` declares `sideEffects` — `false`, or the files that have them, such as stylesheets — so the bundler drops what a surface re-exports and nothing uses.

| Why | Tags |
|---|---|
| a surface re-exports by name more than any one caller uses; without the declaration the bundler keeps every module a surface reaches. | [] |
