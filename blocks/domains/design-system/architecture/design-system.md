# Design system

> Governs the theme's place in the tree.

## Theme

### theme-module-lives-in-the-ui-library · MUST
The theme module lives in `libs/ui/theme/`: the token source, the outputs generated from it, the theme's constants and modes, and the code that applies them.

| Why | Tags |
|---|---|
| the theme knows nothing of the application, and one home lets a tool and a reviewer find every token. | [ux] |
