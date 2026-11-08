# Modes

> Governs the semantic tokens every theme mode resolves, and how its values are derived.

## General

### theme-modes-share-one-token-set · MUST

Every theme mode resolves the same set of semantic tokens.

| Why |
|---|
| a theme mode that lacks a token, or adds one of its own, leaves a component that reads it unstyled or styled apart there, and the theme mode a change forgets ships broken. |

### mode-values-derived-by-rule · SHOULD

Every theme mode's values are derived from the primitive tokens by a declared rule. They are recomputed when a primitive token changes, never picked by eye.

| Why |
|---|
| a value picked by eye stays as it was when a primitive token changes, and is the first to break the contrast of its theme mode. |
