# Route files

> Governs the file names of routes.

## General

### expo-router-file-names-kept → file-name-in-its-owners-case · MUST

A route keeps the names Expo Router finds it by. A layout is `_layout.tsx`, the route of a missing page `+not-found.tsx`, a group `(<name>)/` and a parameter `[<name>].tsx`.

| Why |
|---|
| the router finds its layouts, groups and parameters by these names alone, so a file renamed to the project's case loses its role: a layout becomes a page of its own and a parameter a fixed path. |
