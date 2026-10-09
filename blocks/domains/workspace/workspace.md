---
id: workspace
summary: "Several units in one repository: their folders, imports and links."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---
# Workspace

> A repository that holds several units — the products, what two or more of them share, and what knows nothing of them — each one package, or one package for each of its languages. This domain places the units, sets the direction of the imports between them, and links and checks their packages from the working tree.

## The root

### workspace-root-private · MUST
The root of a workspace is marked private and is never published.

| Why | Tags |
|---|---|
| a consumer who installed the root would get the repository's tooling instead of a unit. | [] |

### root-holds-only-the-workspace · SHOULD
The root of a workspace holds only the workspace and the configuration of its tools, and no code of its own.

| Why | Tags |
|---|---|
| a root with code of its own has something a unit could import by accident, and something that leaks into a consumer. | [] |

### root-holds-one-workspace-per-language · SHOULD
The root holds one workspace for each language, whose members are every package of that language in the repository, and no package holds a workspace of its own.

| Why | Tags |
|---|---|
| a workspace nested in a package is refused by one package manager and ignored by another, so its packages are never linked. | [] |

## Units

### internal-unit-marked-private · MUST
A unit nobody outside the repository installs is marked private in its manifest.

| Why | Tags |
|---|---|
| a publish run over the whole workspace then cannot release it by mistake, with whatever it holds. | [security] |

## Dependencies

### dependency-has-one-version-across-units · MUST
A dependency has one version, or one range, across every manifest of the repository, which the lockfile resolves once.

| Why | Tags |
|---|---|
| two versions of one dependency behave differently in two units, and the difference is found in production. | [] |

### unit-declares-what-it-imports · MUST
A unit declares in its own manifest every dependency it imports, and never relies on one the root or another unit declares.

| Why | Tags |
|---|---|
| an undeclared import works only while another declaration happens to exist, and breaks the unit when it is installed alone or that declaration goes. | [] |

## Imports

### unit-reached-only-through-its-entries → dependency-reached-through-its-public-entry · MUST
A unit, or a script of the root, reaches another unit only by its name, through its entries, never by a path into its folder.

| Why | Tags |
|---|---|
| a path inside a unit is not part of its contract, and an import by path proves an entry no consumer can reach. | [] |

### units-form-no-dependency-cycle → module-imports-form-no-cycle · MUST
The units of a workspace form no cycle, neither in the dependencies their manifests declare nor in their imports.

| Why | Tags |
|---|---|
| units in a cycle cannot be built, released or versioned apart, so they are one unit in disguise. | [] |

## Shared files

### file-lives-once-across-units → fact-has-one-source · MUST
A file several units need lives once in the repository; a unit that needs it at run time takes it from there in its build, and no copy of it is committed.

| Why | Tags |
|---|---|
| one source means a fix is made once and reaches every unit, and a committed copy becomes a second original that drifts from the one reviewed. | [] |

### shared-data-parsed-by-each-reader → outside-value-untyped-until-parsed · MUST
Data in no language that several units read — a schema, a table of cases — is parsed by each unit that reads it, at its edge.

| Why | Tags |
|---|---|
| a reader that trusts the shape of a file it does not own breaks unseen when the file changes. | [data] |

### shared-data-read-by-specs-from-its-file · MUST
Shared data is read by a unit's specs from its file in the repository, by its path, never from a copy.

| Why | Tags |
|---|---|
| a spec that reads a copy keeps passing after the file it stands for has changed. | [testing] |

## Checks

### unit-checked-by-its-own-parts → rule-held-by-a-tool-where-one-can · MUST
In a workspace, the files of each package are held by the parts of its own blocks — the repository's and those its path under `packages` in `constitution.yaml` adds — and no package's parts reach another package's files.

| Why | Tags |
|---|---|
| a part applied from the root either misses a package's paths, as one that names `src/` does, and passes in silence, or applies one package's parts to the others and changes their rules. | [] |

## Requirements for implementation

### workspace-tool-links-units-from-the-working-tree · SHOULD
The tool that manages a workspace resolves the repository's own units from the working tree, never from the registry.

| Why | Tags |
|---|---|
| a change to a unit is then tested by every unit that uses it before it is published. | [testing] |
