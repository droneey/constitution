# Layout

> Governs a package's tree in CSS: how a module offers its styles through its surface.

## Vocabulary

A module's **stylesheet surface**, **`index.css`**{#surface}, is the surface it offers its styles through, beside the surface its code offers in its programming language.

## Surfaces

### module-styles-offered-by-a-stylesheet-surface → module-reached-only-through-its-surface · MUST

Every module that ships styles offers them through its stylesheet surface.

| Why |
|---|
| the surface a module's code offers in its programming language cannot re-export a stylesheet, and a path past the module's surface couples to a file the module is free to move — information hiding. |
