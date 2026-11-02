# Source

> Governs where shadcn source is added.

## General

### shadcn-source-added-into-the-kit → vendored-component-placed-by-its-home · MUST

shadcn source is added into the UI kit as source, never imported from a package. Before review it is placed and named by the kit's homes and its imports are rewritten to the project's alias; `components.json` names the kit's folders.

| Why |
|---|
| a component left where the generator wrote it, or imported from a package, sits outside the kit's homes, so a reader does not find it where every other component is and a copy of it hides in a dependency. |
