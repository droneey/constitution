# Dependencies

> Governs the exports map, the pinned tools, stateful packages and polyfills.

## Pinning

### tools-pinned-in-dev-dependencies → tool-pinned-exactly-by-the-repository · MUST

Every tool the npm registry publishes is a `devDependencies` entry of `package.json` at an exact version, with no range; a unit of the repository itself, linked from its working tree, is no such tool.

| Why | Tags |
|---|---|
| `devDependencies` install with the repository and never with the package, and an exact version lets no lockfile update move a tool without a change to the manifest. | [] |

### stateful-package-resolved-once · SHOULD

A package that holds state or types across the program — the schema library, the user-interface framework — resolves to one version in the lockfile.

| Why | Tags |
|---|---|
| two copies of such a package split its state, and its types stop matching across the split. | [] |

## Choosing and using

### exports-map-each-entry · MUST

The `package.json` of a package others import maps each of its entries in `exports`, so no path outside those entries can be imported.

| Why | Tags |
|---|---|
| a path `exports` does not map cannot be imported, so the entries listed are the whole of what a consumer can couple to. | [] |

### missing-built-in-polyfilled-by-the-entry · MUST

A built-in the code relies on that a runtime it supports lacks — `Temporal`, `Symbol.dispose`, `DisposableStack` — gets its polyfill once, imported by the entry file before any code uses it; a package others install imports the polyfill's module value and never installs it globally.

| Why | Tags |
|---|---|
| every module then finds the one `Temporal`, and no date is read before it exists or through a second copy. | [] |
