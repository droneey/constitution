# Layout

> Governs the specifier an import is written with, by whether it crosses a module's border.

## Imports

### hash-imports-leave-the-module · MUST

Every import of its package's own code that leaves its module is written from `#/`, never by a relative path.

| Why |
|---|
| an import that crosses a module's border written as a relative path reads like one inside it, so neither a reviewer nor the tool that holds the surfaces can tell which imports go through a surface. |

### relative-import-stays-in-its-module → file-never-imports-its-own-modules-surface · MUST

Every import inside its own module is written by a relative path, never from `#/`.

| Why |
|---|
| a `#/` path that names its own module's folder reaches the module's surface, the import its parent bars, and one that names a file inside reads like a crossing of the module's border. |
