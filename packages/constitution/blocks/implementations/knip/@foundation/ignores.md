# Ignores

> Governs the entries a project adds to knip's `ignore…` options.

## General

### knip-ignore-states-its-reason → suppression-states-its-reason · MUST

Every entry a project adds to an `ignore…` option of knip carries its reason. An entry of any of them in `knip.jsonc`, such as `ignore`, `ignoreFiles`, `ignoreDependencies`, `ignoreBinaries`, `ignoreMembers`, `ignoreUnresolved` or `ignoreIssues`, carries it in a comment beside it.

| Why |
|---|
| these options are where knip is silenced, so an entry without its reason cannot be judged, and stays after the file, dependency or export it excused is gone. |
