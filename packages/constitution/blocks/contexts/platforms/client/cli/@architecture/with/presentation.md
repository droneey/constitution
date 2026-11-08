# Presentation

> Governs how a subcommand reaches the screen it renders.

## Rendering

### subcommand-renders-through-a-renderer-the-root-hands → binding-unit-imports-nothing-of-the-ui · MUST

Every subcommand's binding unit renders its screen only through a renderer the composition root hands it. It never imports the terminal's renderer, which the handed renderer loads.

| Why |
|---|
| a binding unit that imports the terminal's renderer makes the choice between the terminal and the plain path itself, where the renderer the root builds and hands it should, so no pipe or spec can take the plain path without the terminal. |
