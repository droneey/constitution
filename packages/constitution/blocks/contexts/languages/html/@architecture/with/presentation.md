# Presentation

> Governs where a screen declares what its document says about it and the scripts of other parties it loads.

## Screens

### document-metadata-owned-by-screen · SHOULD

Every piece of a document's metadata, such as its description and its links, is declared by the screen that owns it.

| Why |
|---|
| metadata declared in a central file is left stale when its screen changes, and that file must know every screen. |

### third-party-script-declared-where-it-is-used · MUST

Every script of another party is declared by the code that uses it, never in a shared document every screen loads. That code is a screen, a component, or the adapter of a service behind a port.

| Why |
|---|
| a script declared in a shared document runs on every screen, those that never use it included, so its party reads what each of them shows and learns of each visit, and it stays after the code that needed it is gone. |
