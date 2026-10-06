# TypeScript with workspace

> The package names of a TypeScript workspace's units.

## typescript-unit-names-under-the-scope → unit-named-after-its-folder
`packages/<name>/` is `@<scope>/<name>`; `shared/` is `@<scope>/shared`, its parts entries of `exports` reached by subpath, `@<scope>/shared/contracts`; and `libs/<name>/` is `@<scope>/libs-<name>`.

| Why | Check | Tags |
|---|---|---|
| a registry takes one slash in a package's name, the scope's, so a folder of `libs/` is spelled into the name, and a part of `shared/` is an entry of the one package. | review | [] |
