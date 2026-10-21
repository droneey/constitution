# Workspace

> Governs how the packages of a TypeScript workspace are compiled.

## Compilation

### unit-compiled-by-its-own-options → unit-checked-by-its-own-tools · MUST

Each package is compiled with its own compiler options alone: a package that imports another is checked against the declarations of the other's entries, never against the other's source compiled with its own options.

| Why | Tags |
|---|---|
| the compiler applies the options and the `paths` of the program it checks to every file it compiles, so an alias of the imported package would resolve into the importer's `src/`, and an option the importer turns on would fail in a file the importer does not own. | [] |
