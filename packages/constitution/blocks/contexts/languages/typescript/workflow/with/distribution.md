# TypeScript with distribution

> Governs when a TypeScript package others install raises its floor.

## Releases

### engines-floor-raised-only-in-a-major → runtime-floor-never-raised-in-a-patch · MUST

A package others install raises the floor of `engines` only in a major release.

| Why | Tags |
|---|---|
| npm and the package managers beside it only warn about `engines`, so a consumer on a caret range takes a minor that drops its runtime and fails when it runs. | [] |
