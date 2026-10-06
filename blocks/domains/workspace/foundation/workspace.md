# Workspace

## The root and the units

## workspace-root-private · SHOULD
The root of a workspace is private and never published.

| Why | Check | Tags |
|---|---|---|
| the root is the repository's workspace, not a unit, and a consumer who installed it would get the repository's tooling instead of a unit. | review | [] |

## unit-anatomy · SHOULD
Each unit holds its manifest, its source, and its specs where its language keeps them.

| Why | Check | Tags |
|---|---|---|
| every unit looks the same inside, so a reader and a tool know where each part is. | review | [] |

## Imports between units

## units-imported-by-their-entries → dependencies-imported-from-their-entries
A unit, and a script of the root, imports another unit by the unit's package name, through its entries, never by a path into its folder.

| Why | Check | Tags |
|---|---|---|
| a path inside a unit is not part of its contract, and an import by path proves an entry no consumer can reach. | tool/imports | [] |

## The check

## unit-checked-by-its-own-parts → check-chains-one-entry-per-area
In a workspace, the files of each unit are held by the parts of its own blocks — the repository's and those its path under `packages` in `constitution.yaml` adds — and no unit's parts reach another unit's files; each area's entry runs each of its tools for every unit that holds files of a language the tool covers. A tool that reads the whole repository — its manifests, its lockfiles, its history — runs once, from the root.

| Why | Check | Tags |
|---|---|---|
| a part applied from the root either misses a unit's paths, as one that names `src/` does, and passes in silence, or applies one unit's parts to the others and changes their rules. | review | [] |

## What units share

## file-lives-once-across-units → one-home-per-datum
A file several units need lives once in the repository, and a unit that must ship it holds only a copy generated from it.

| Why | Check | Tags |
|---|---|---|
| one source means a fix is made once and reaches every unit, and no copy becomes a second original. | review | [] |

## generated-copy-guarded-by-spec → file-lives-once-across-units
A copy a unit ships of a shared file is rebuilt by the unit's build, never edited by hand, and a spec asserts it equals its source.

| Why | Check | Tags |
|---|---|---|
| a copy that drifts from its source ships a different file than the one reviewed. | test | [testing] |

## shared-data-parsed-by-each-reader → outside-values-untyped-until-parsed
Data in no language that several units read — a schema, a table of cases — is parsed by each unit that reads it, at its edge, and that unit's specs read the file itself, never a copy of it.

| Why | Check | Tags |
|---|---|---|
| each reader then proves it reads the file as it is; a reader that trusts its shape, or a spec that reads a copy, passes after the file has changed. | test | [testing] |

## Requirements for implementation

What any tool that manages a workspace must provide.

## units-linked-from-the-working-tree · SHOULD
The tool resolves the repository's own units from the working tree, not from the registry.

| Why | Check | Tags |
|---|---|---|
| a change to a unit is then tested by every unit that uses it before it is published. | review | [] |
