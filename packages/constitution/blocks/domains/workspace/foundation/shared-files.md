# Shared files

> Governs a file or data that several units need.

## General

### file-lives-once-across-units → fact-has-one-source · MUST

A file several packages need lives once, in a package of its own; a package that needs it at run time takes it by that package's name, bundled by its build or installed beside it as a dependency, and no copy of it is committed.

| Why |
|---|
| one source means a fix is made once and reaches every unit, and a committed copy becomes a second original that drifts from the one reviewed. |
