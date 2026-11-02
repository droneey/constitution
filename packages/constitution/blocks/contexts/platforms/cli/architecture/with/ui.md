# User interface

> Governs how a command reaches the screen it renders.

## Rendering

### command-renders-through-a-renderer-the-root-hands → binding-unit-imports-nothing-of-the-ui · MUST

A command renders its screen through a renderer the root hands it. The renderer loads the terminal renderer and the screen; the command imports neither.

| Why |
|---|
| a command that imports its screen or the terminal renderer makes the binding unit import the interface, the reverse of the direction the two keep, and puts the choice between the terminal and the plain path in the command instead of the renderer the root builds and hands it. |
