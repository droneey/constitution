# Ignores

> Governs the entries a project adds to knip's ignore lists.

## General

### knip-ignore-states-its-reason → suppression-silences-one-finding · MUST

Every entry a project adds to knip's ignore lists carries its reason. An entry of `ignore`, `ignoreDependencies`, `ignoreBinaries` or `ignoreExportsUsedInFile` in `knip.jsonc` carries it in a comment beside it.

| Why |
|---|
| these lists are where knip is silenced, so an entry without its reason cannot be judged, and stays after the file, dependency or export it excused is gone. |
