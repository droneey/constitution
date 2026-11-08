# Dependencies

> Governs the packages a TypeScript program takes from others: how a stateful package resolves and where a program polyfills a missing built-in.

## Resolution

### stateful-package-resolved-once · MUST

Every package that holds state or types across the program resolves to one version in the lockfile. Such packages include a validation library and a user-interface framework.

| Why |
|---|
| two copies of such a package split its state, and its types stop matching across the split. |

## Polyfills

### missing-built-in-polyfilled-by-the-entry · MUST

Every missing built-in a program relies on is polyfilled once, by its entry file. It is a built-in a runtime the program supports lacks, such as `Temporal`, `Symbol.dispose` or `DisposableStack`, and the entry file imports its polyfill before any code uses it. Exempt: a package others install, which imports the polyfill's module value where it uses the built-in.

| Why |
|---|
| a polyfill imported where it is first used leaves the modules that load before it without the built-in, and one imported in two places gives two copies whose values do not mix, as the dates of two `Temporal`s do not. |
