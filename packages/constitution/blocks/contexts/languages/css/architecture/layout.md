# Layout

> Governs a package's tree in CSS: how a module offers its styles through its surface.

## Surfaces

### module-styles-offered-by-a-stylesheet-surface → module-reached-only-through-its-surface · MUST

A module that ships styles offers them through a stylesheet surface. The surface is `index.css`, beside its script surface: the entry stylesheet imports it by path, and inside the module the surface imports its parts.

| Why |
|---|
| a script surface cannot re-export a stylesheet, and a path past the module's surface couples to a file the module is free to move — information hiding. |
