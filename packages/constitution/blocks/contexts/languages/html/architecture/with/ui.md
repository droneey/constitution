# User interface

> Governs where a screen declares what its document says about it and the scripts of other parties it loads.

## Screens

### document-metadata-owned-by-screen · MUST

The description and links of the document are declared by the screen that owns them.

| Why |
|---|
| metadata declared in a central file is left stale when its screen changes, and that file must know every screen. |

### third-party-script-declared-where-it-is-used · MUST

A script of another party is declared by the code that uses it, never in a shared document every screen loads. That code is a screen, a component, or the adapter of a service behind a port.

| Why |
|---|
| a script declared in a shared document loads on every screen, those that never use it included, and stays after the code that needed it is gone. |
