# Stores

> Governs the stores the interface's root builds.

## General

### client-concerns-in-root-built-stores → fact-has-one-source · MUST

The few global concerns the client owns — the theme, the notices — live in small stores the root builds, one store per concern.

| Why |
|---|
| a concern every screen shares has one home, which the root hands to the screens and a spec replaces; a store built anywhere else is a second copy of it. |
