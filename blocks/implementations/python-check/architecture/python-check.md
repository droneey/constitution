# python-check

## relative-import-kept-in-its-module → relative-imports-stay-in-the-feature
A relative import whose target lies outside the importing file's module fails the check — its feature, outside `features/` its top-level folder, and the import package's own files for a file that sits beside them — and so does a feature's import of itself by its absolute path.

| Why | Check | Tags |
|---|---|---|
| the linter bans relative imports only all at once, or those that climb past the package. | tool/imports | [] |
