---
id: workspace
summary: "Several units in one repository: their folders, imports and links."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**"]
---

# Workspace

> A repository that holds several units — its programs, the parts two or more of them share, and what knows nothing of the product — each one package, or one package for each of its languages. This domain places the units, sets the direction of the imports between them, and links and checks their packages from the working tree.

## The root

### root-and-internal-units-private · MUST

The root and every unit nobody outside installs are marked private.

| Why | Tags |
|---|---|
| a consumer who installed the root would get the repository's tooling instead of a unit, and a publish run over the whole workspace cannot release by mistake a unit nobody outside installs, with whatever it holds. | [security] |

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

## Dependencies

### dependency-has-one-version-across-units · MUST

A dependency has one version, or one range, across every manifest of the repository, which the lockfile resolves once — save the peer range a distributed unit declares for a dependency its consumer owns.

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

A file several packages need lives once in the repository; a package that needs it at run time takes it from there in its build, and no copy of it is committed.

| Why | Tags |
|---|---|
| one source means a fix is made once and reaches every unit, and a committed copy becomes a second original that drifts from the one reviewed. | [] |

### shared-data-parsed-by-each-reader → outside-value-untyped-until-parsed · MUST

Data in no language that several packages read — a schema, a table of cases — is parsed by each package that reads it, at its edge.

| Why | Tags |
|---|---|
| a reader that trusts the shape of a file it does not own breaks unseen when the file changes. | [data] |

## Checks

### unit-checked-by-its-own-tools → rule-held-by-a-tool-where-one-can · MUST

In a workspace, the files of each package are checked by the tools of its own blocks with that package's configuration, and no package's checks reach another package's files.

| Why | Tags |
|---|---|
| a tool's configuration applied from the root either misses a package's paths, as one that names `src/` does, and passes in silence, or applies one package's configuration to the others and changes their rules. | [] |

## Requirements for implementation

### workspace-tool-links-units-from-the-working-tree · SHOULD

The tool that manages a workspace resolves the repository's own units from the working tree, never from the registry.

| Why | Tags |
|---|---|
| a change to a unit is then tested by every unit that uses it before it is published. | [testing] |
