# python-check

### relative-import-kept-in-its-feature → relative-imports-stay-in-the-module · MUST
A relative import whose target lies outside the importing file's module fails the check — its feature, outside `features/` its top-level folder, and the import package's own files for a file that sits beside them — and so does a feature's import of itself by its absolute path.

| Why | Tags |
|---|---|
| the linter bans relative imports only all at once, or those that climb past the package. | [] |

### packages-kept-to-their-homes → layer-imports-dependencies-by-its-role · MUST
An import of a package — neither the standard library, the import package itself nor a unit of the workspace — fails the check in `domain/`, `kernel/` and `contracts/`; outside the edge, in a folder its home does not name; and, where its home is narrower than the edge, in a folder of the edge its home leaves out. The edge is `adapters/`, `libs/`, `root/`, `integrations/`, the entry files and the top-level folder that is neither a layer nor a role folder, the delivery layer.

| Why | Tags |
|---|---|
| an import contract forbids a package only by its name, one contract per package, and knows nothing of a package nobody named; the check reads every import against the table and the homes the parts give. | [] |
### effect-modules-kept-at-the-edge → effects-held-only-by-the-edge · MUST
A module of the standard library that reaches input and output, the clock, randomness or identifiers — `os`, `subprocess`, `socket`, `time`, `random`, `uuid` among them — fails the check outside the edge.

| Why | Tags |
|---|---|
| the standard library needs no install, so no table of homes sees it, and an effect reached from a use case stays out of every fake its specs give it. | [] |

