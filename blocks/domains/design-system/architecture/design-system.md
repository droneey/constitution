# Design system

> Governs the theme's and the primitives' place in the tree.

## Primitives

### primitives-are-a-set-of-components → behaviour-lives-in-a-feature · SHOULD
A set of interface primitives is a set of components, each a module of its own in `components/<name>/`, and grows `features/` only when it gains behaviour of the product.

| Why | Tags |
|---|---|
| a primitive offers mechanism, not behaviour, so it needs no feature's layers, and a component found in its own folder is found the same way in every kit. | [] |

## Theme

### theme-module-lives-in-the-ui-library · MUST
The theme module lives in `libs/ui/theme/`: the token source, the outputs generated from it, the theme's constants and modes, and the code that applies them.

| Why | Tags |
|---|---|
| the theme knows nothing of the application, and one home lets a tool and a reviewer find every token. | [ux] |
