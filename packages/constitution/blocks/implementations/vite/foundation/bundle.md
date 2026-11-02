# Bundle

> Governs what the bundler may drop.

## General

### manifest-declares-side-effects · SHOULD

The program's `package.json` declares `sideEffects`. It is `false`, or the files that have them, such as stylesheets, so the bundler drops what a surface re-exports and nothing uses.

| Why |
|---|
| a surface re-exports by name more than any one caller uses, so without the declaration the bundler keeps every module a surface reaches, and the bundle ships code nothing runs. |
