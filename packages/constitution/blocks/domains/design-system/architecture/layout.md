# Layout

> Governs where the theme and the primitives live in the tree.

## Primitives

### primitives-are-a-set-of-components → behaviour-lives-in-a-feature · MUST

A set of interface primitives is a set of components. Each is a module of its own in `components/<name>/`, and the set takes a feature's layers only when it gains behaviour of the product.

| Why |
|---|
| a primitive offers mechanism, not behaviour, so a feature's layers around it stay empty for every reader to open, and a primitive kept outside a folder of its own is not where a reader of any other kit looks for it. |

## Theme

### theme-module-lives-in-the-ui-library · MUST

The theme module lives in the interface's generic library. It is the folder **`theme/`**{#theme-module} of `libs/ui`, and holds the token source, or the outputs generated from tokens a package supplies, the theme's constants and modes, and the code that applies them.

| Why |
|---|
| a theme kept in the program's own code ties to it a part that knows nothing of the product, and a token kept outside the theme's one home is missed by the tool and the reviewer that look for every token there. |
