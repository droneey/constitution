# Stores

> Governs the stores the interface's root builds.

## General

### client-concerns-in-root-built-stores → composition-root-assembles-the-program · MUST

Each global concern the client owns lives in a store of its own, which the root builds. Such a concern — the theme, the notices — is one every screen shares, and its store holds that concern alone.

| Why |
|---|
| a store built anywhere but the root is a second copy of a concern every screen shares, so two screens show two themes or two lists of notices, and a spec cannot hand in its own — a single source of truth. |
