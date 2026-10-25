# Version control

> Governs the generated route tree in the history.

## General

### route-tree-committed → generated-files-not-committed · SHOULD

`routeTree.gen.ts` is committed, and only the router's generator changes it.

| Why |
|---|
| the router's own guidance counts it as part of the application's runtime, not a build artefact. |
