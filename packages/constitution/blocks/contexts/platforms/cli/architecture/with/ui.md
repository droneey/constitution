# User interface

> Governs how a command reaches the screen it renders.

## Rendering

### command-renders-through-a-renderer-the-root-hands → binding-unit-imports-nothing-of-the-ui · MUST

A command renders its screen through a renderer the root hands it, which loads the terminal renderer and the screen; the command imports neither.

| Why |
|---|
| the command stays a binding unit the interface imports and never the reverse, and the root alone chooses between the terminal and the plain path. |
