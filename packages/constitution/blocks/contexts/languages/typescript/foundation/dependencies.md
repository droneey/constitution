# Dependencies

> Governs stateful packages and polyfills.

## Resolution

### stateful-package-resolved-once · SHOULD

A package that holds state or types across the program — the schema library, the user-interface framework — resolves to one version in the lockfile.

| Why | Tags |
|---|---|
| two copies of such a package split its state, and its types stop matching across the split. | [] |

## Choosing and using

### missing-built-in-polyfilled-by-the-entry · MUST

A built-in the code relies on that a runtime it supports lacks — `Temporal`, `Symbol.dispose`, `DisposableStack` — gets its polyfill once, imported by the entry file before any code uses it; a package others install imports the polyfill's module value and never installs it globally.

| Why | Tags |
|---|---|
| every module then finds the one `Temporal`, and no date is read before it exists or through a second copy. | [] |
