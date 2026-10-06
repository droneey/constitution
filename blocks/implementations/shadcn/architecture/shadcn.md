# shadcn

## shadcn-source-added-into-the-kit → vendored-component-placed-by-its-home · MUST
shadcn source is added into the UI kit as source, never imported from a package, and before review is placed and named by the kit's homes, its imports rewritten to the project's alias; `components.json` names the kit's folders.

| Why | Check | Tags |
|---|---|---|
| the source becomes part of the kit's tree, found where every other component is, and no copy of it hides in a dependency. | review | [] |
