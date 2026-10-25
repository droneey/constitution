# User interface

> Governs where a screen declares what its document says about it and the scripts of other parties it loads.

## Screens

### document-metadata-owned-by-screen · SHOULD

The description and links of the document are declared by the screen that owns them.

| Why |
|---|
| metadata declared beside what it describes changes with it, and no central file must know every screen. |

### third-party-script-declared-where-it-is-used · SHOULD

A script of another party is declared by the code that uses it — a screen, a component, or the adapter of a service behind a port — never in a shared document every screen loads.

| Why |
|---|
| a script declared where it is used loads only where it is needed and leaves with the code that needs it. |
