# shadcn

## shadcn-source-added-into-the-kit → vendored-component-placed-by-its-home · MUST
shadcn source is added with its CLI into the UI kit, never imported from a package, and before review is placed and named by the kit's homes, its imports rewritten to the project's alias. `components.json` points the CLI at the kit's folders.

| Why | Check | Tags |
|---|---|---|
| the source becomes part of the kit's tree, found where every other component is, and no copy of it hides in a dependency. | review | [] |

## shadcn-text-passed-by-props → primitives-take-text-by-props
The text shadcn source ships — a screen reader's "Close" among it — is removed on arrival, and the component takes it by a prop.

| Why | Check | Tags |
|---|---|---|
| the shipped strings are English and fixed, so a kit that keeps them speaks one language whatever the program's locale. | review | [] |
