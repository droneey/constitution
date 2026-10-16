# Browser with a user interface

> Governs where a screen declares what the document says about it.

## User interface

### document-metadata-owned-by-screen · SHOULD

The description and links of the document are declared by the screen that owns them.

| Why | Tags |
|---|---|
| metadata declared beside what it describes changes with it, and no central file must know every screen. | [] |

### third-party-script-declared-where-it-is-used · SHOULD

A script of another party is declared by the screen or component that uses it, never in a shared document every screen loads.

| Why | Tags |
|---|---|
| a script declared where it is used loads only where it is needed and leaves with the code that needs it. | [performance] |
