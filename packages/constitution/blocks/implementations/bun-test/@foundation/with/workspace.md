# Workspace

> Governs the coverage gate of each package of a workspace.

## General

### coverage-gate-on-the-unit-alone → package-checks-reach-only-its-own-files · MUST

In a workspace, every package's coverage gate counts only its own files. Its `bunfig.integration.toml` adds `"../**"` to `coveragePathIgnorePatterns`, so the gate never counts the files of a package it imports.

| Why |
|---|
| Bun counts every file a spec loads, an imported package's source included, so a package whose specs use one function of another fails on the other's functions it never calls; the other package's own specs hold its files. |
