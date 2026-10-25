# Manifest

> Governs `package.json`: the module type a package declares, its entries and import aliases, and the tools it pins.

## Modules

### manifest-declares-the-module-type → package-is-an-es-module · MUST

Every `package.json` sets `"type": "module"`.

| Why |
|---|
| without it Node.js and the tools that follow its resolution load a `.js` file as CommonJS, so one module means one thing to one runtime and another to them. |

## Entries and aliases

### exports-map-each-entry · MUST

The `package.json` of a package others import maps each of its entries in `exports`, so no path outside those entries can be imported.

| Why |
|---|
| a path `exports` does not map cannot be imported, so the entries listed are the whole of what a consumer can couple to. |

### alias-declared-in-package-imports · MUST

Every import alias is declared once, in `imports` of `package.json`; a tool that cannot read `imports` mirrors it word for word, and no configuration declares an alias of its own.

| Why |
|---|
| one declaration is the source and a mirror is checked against it on sight; an alias declared elsewhere drifts unseen. Node.js and the compiler read `imports`, and a runtime that reads a `#/` alias only through `paths` takes it from the mirror. |

### hash-alias-for-the-source-root · MUST

The source root is aliased `#/`, as `"#/*": "./src/*"` in `imports` of `package.json`, so a `#/<path>` specifier names `<path>` under its package's `src/`; code that runs on a runtime that resolves no `#/` specifier is bundled first.

| Why |
|---|
| an import from the source root then reads the same in every program, whatever folder it is written in; the runtimes and the compiler resolve it from this one entry, and `#` is the prefix `imports` requires. |

## Pinning

### tools-pinned-in-dev-dependencies → tool-pinned-exactly-by-the-repository · MUST

Every tool the npm registry publishes is a `devDependencies` entry of `package.json` at an exact version, with no range; a unit of the repository itself, linked from its working tree, is no such tool.

| Why |
|---|
| `devDependencies` install with the repository and never with the package, and an exact version lets no lockfile update move a tool without a change to the manifest. |
