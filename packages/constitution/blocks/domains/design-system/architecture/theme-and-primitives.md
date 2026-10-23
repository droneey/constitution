# Theme and primitives

> Governs the theme's and the primitives' place in the tree.

## Primitives

### primitives-are-a-set-of-components → behaviour-lives-in-a-feature · SHOULD

A set of interface primitives is a set of components, each a module of its own in `components/<name>/`, and grows `features/` only when it gains behaviour of the product.

| Why | Tags |
|---|---|
| a primitive offers mechanism, not behaviour, so it needs no feature's layers, and a component found in its own folder is found the same way in every kit. | [] |

## Theme

### theme-module-lives-in-the-ui-library · MUST

The theme module lives in `libs/ui/theme/`: the token source — or, where a package of tokens supplies them, the reading of them — the outputs generated from it, the theme's constants and modes, and the code that applies them.

| Why | Tags |
|---|---|
| the theme knows nothing of the application, and one home lets a tool and a reviewer find every token. | [ux] |

### token-package-ships-its-tokens-in-tokens → package-laid-out-by-the-tree · SHOULD

A package of tokens holds them as the content it ships, in `tokens/`, and no theme module.

| Why | Tags |
|---|---|
| the tokens are data every platform reads at its build, so the package ships them as they are and holds no code of a platform. | [] |
