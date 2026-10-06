# TypeScript with workspace

> The package names of a TypeScript workspace's units.

### typescript-unit-names-under-the-scope → unit-named-after-its-folder
A product is `@<scope>/<name>`, `shared/` is `@<scope>/shared`, and a unit of `libs/` is `@<scope>/libs-<name>`; an integration is the subpath of its framework, `@<scope>/<name>/<framework>`.

| Why | Tags |
|---|---|
| a registry takes one slash in a package's name, the scope's, so a folder of `libs/` is spelled into the name, and an integration is an entry of the one package rather than a package of its own. | [] |
