# Manifest

> Governs `package.json`: the module type a package declares, its entries and import aliases, and the tools it pins.

## Modules

### manifest-declares-the-module-type → package-is-an-es-module · MUST

Every `package.json` sets `"type": "module"`.

| Why |
|---|
| without it Node.js and the tools that follow its resolution load a `.js` file as CommonJS, so one module means one thing to one runtime and another to them. |

## Entries and aliases

### exports-map-each-entry → dependency-reached-through-its-published-entries · MUST

A package others import maps each of its entries in `exports`. Its `package.json` lists every entry there, so no path outside those entries can be imported.

| Why |
|---|
| without the map every file of the package can be imported, so a consumer couples to an internal path that the next release moves — information hiding. |

### alias-declared-in-package-imports · MUST

Every import alias is declared once, in `imports` of `package.json`. A tool that cannot read `imports` mirrors it word for word, and no configuration declares an alias of its own.

| Why |
|---|
| an alias declared in a tool's own configuration drifts unseen from the one Node.js and the compiler read in `imports`, so one tool resolves an import another refuses; a mirror is checked against its source on sight, and a runtime that reads a `#/` alias only through `paths` takes it from the mirror — a single source of truth. |

### hash-alias-for-the-source-root · MUST

The source root is aliased `#/`. The alias is `"#/*": "./src/*"` in `imports` of `package.json`, so a `#/<path>` specifier names `<path>` under its package's `src/`; code that runs on a runtime that resolves no `#/` specifier is bundled first.

| Why |
|---|
| an import from the source root written as a relative path climbs by its own file's depth, reads differently in every folder and breaks when its file moves; the runtimes and the compiler resolve `#/` from this one entry, and `#` is the prefix `imports` requires. |

## Pinning

### tools-pinned-in-dev-dependencies → tool-pinned-exactly-by-the-repository · MUST

A tool from the npm registry is pinned exactly in `devDependencies`. Every tool the npm registry publishes is a `devDependencies` entry of `package.json` at an exact version, with no range; a unit of the repository itself, linked from its working tree, is no such tool.

| Why |
|---|
| a tool declared outside `devDependencies` installs with the package into every consumer, and one on a range moves with a lockfile update no change to the manifest shows, so the check reports differently with nothing in the diff. |
