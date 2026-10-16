# TypeScript with workspace

> Governs the package names of a TypeScript workspace's units.

## Workspace

### unit-package-named-under-the-scope → unit-named-after-its-folder · SHOULD

An app is `@<scope>/<name>`, a part of `shared/` is `@<scope>/shared-<name>`, and a unit of `libs/` is `@<scope>/libs-<name>`; an integration is the subpath of its framework, `@<scope>/<name>/<framework>`.

| Why | Tags |
|---|---|
| a registry takes one slash in a package's name, the scope's, so the folder of `shared/` or `libs/` is spelled into the name, and an integration is an entry of the one package rather than a package of its own. | [] |
