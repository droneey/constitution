# Vite

## bundle-measured-against-budget → bundle-size-budget
The build's output is measured against the bundle's size budget in the check, entry by entry.

| Why | Check | Tags |
|---|---|---|
| the budget holds only if every build is measured against it. | review | [] |

## manifest-declares-side-effects · SHOULD
The application's `package.json` declares `sideEffects` — `false`, or the files that have them, such as stylesheets — so the bundler drops what a surface re-exports and nothing uses.

| Why | Check | Tags |
|---|---|---|
| a surface re-exports a folder whole; without the declaration the bundler keeps every module it could reach. | review | [] |
