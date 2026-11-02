# Dependencies

> Governs the packages a TypeScript program takes from others: how a stateful package resolves and where a missing built-in is polyfilled.

## Resolution

### stateful-package-resolved-once · SHOULD

A package that holds state or types across the program resolves to one version in the lockfile. Such packages include the schema library and the user-interface framework.

| Why |
|---|
| two copies of such a package split its state, and its types stop matching across the split. |

## Choosing and using

### missing-built-in-polyfilled-by-the-entry · MUST

A missing built-in is polyfilled once, by the entry file. It is a built-in the code relies on that a runtime it supports lacks — `Temporal`, `Symbol.dispose`, `DisposableStack` — and the entry file imports its polyfill before any code uses it; a package others install imports the polyfill's module value and never installs it globally.

| Why |
|---|
| a polyfill imported where it is first used leaves the modules that load before it without the built-in, and one imported in two places gives two copies whose values do not mix, as the dates of two `Temporal`s do not; one a package installs globally replaces its consumer's. |
