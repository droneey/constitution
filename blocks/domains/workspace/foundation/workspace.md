# Workspace

## The root and the units

### workspace-root-private · SHOULD
The root of a workspace is private and never published.

| Why | Tags |
|---|---|
| the root is the repository's workspace, not a unit, and a consumer who installed it would get the repository's tooling instead of a unit. | [] |

### one-workspace-per-language · SHOULD
The root holds one workspace for each language, whose members are every package of that language in the repository, and no package holds a workspace of its own.

| Why | Tags |
|---|---|
| a package manager links and resolves the packages of one workspace together, and a workspace nested in a package is refused by one manager and ignored by another, so its packages are never linked. | [] |

### unit-anatomy · SHOULD
Each package holds its manifest, its source, and its specs where its language keeps them.

| Why | Tags |
|---|---|
| every package looks the same inside, so a reader and a tool know where each part is. | [] |

## Imports between units

### units-imported-by-their-entries → dependencies-imported-from-their-entries
A unit, and a script of the root, imports another unit by its name, through its entries, never by a path into its folder.

| Why | Tags |
|---|---|
| a path inside a unit is not part of its contract, and an import by path proves an entry no consumer can reach. | [] |

## The tools

### unit-checked-by-its-own-parts → rules-held-by-tools
In a workspace, the files of each package are held by the parts of its own blocks — the repository's and those its path under `packages` in `constitution.yaml` adds — and no package's parts reach another package's files.

| Why | Tags |
|---|---|
| a part applied from the root either misses a package's paths, as one that names `src/` does, and passes in silence, or applies one package's parts to the others and changes their rules. | [] |

## What units share

### file-lives-once-across-units → one-home-per-datum
A file several packages need lives once in the repository; a package that needs it at run time takes it from there in its build, and no copy of it is committed.

| Why | Tags |
|---|---|
| one source means a fix is made once and reaches every package, and a committed copy becomes a second original that drifts from the one reviewed. | [] |

### shared-data-parsed-by-each-reader → outside-values-untyped-until-parsed
Data in no language that several packages read — a schema, a table of cases — is parsed by each package that reads it, at its edge, and that package's specs read the file itself by its path, never a copy of it.

| Why | Tags |
|---|---|
| each reader then proves it reads the file as it is; a reader that trusts its shape, or a spec that reads a copy, passes after the file has changed. | [testing] |

## Requirements for implementation

What any tool that manages a workspace must provide.

### units-linked-from-the-working-tree · SHOULD
The tool resolves the repository's own units from the working tree, not from the registry.

| Why | Tags |
|---|---|
| a change to a unit is then tested by every unit that uses it before it is published. | [] |
