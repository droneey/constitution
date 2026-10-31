# Ignores

> Governs the entries a project adds to knip's ignore lists.

## General

### knip-ignore-states-its-reason → suppression-silences-one-finding · MUST

An entry a project adds to `ignore`, `ignoreDependencies`, `ignoreBinaries` or `ignoreExportsUsedInFile` in `knip.jsonc` carries its reason in a comment beside it.

| Why |
|---|
| these lists are where knip is silenced, so each entry must say why the file, dependency or export is in use. |
