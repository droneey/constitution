---
id: react-native
summary: React on a device — host components, virtualised lists, modules.
requires: [mobile]
extends: _react
abstract: false
languages: []
dictionary: [React Native]
governs: ["**/*.tsx"]
---

# React Native

> React rendering to a phone's or tablet's native views. Written thin: its host components, accessibility props, gestures and safe areas get their rules with the first mobile project.

### list-never-mapped-in-a-scroll-view → long-lists-virtualised · SHOULD
A list that can grow is never `map` in a `ScrollView`.

| Why | Tags |
|---|---|
| a `ScrollView` mounts every child at once, so a mapped list in it renders every row however long it grows. | [] |

### no-literal-colour-in-a-style → tokens-single-source-of-appearance · MUST
A style names no literal colour.

| Why | Tags |
|---|---|
| a literal colour is a second palette the next theme misses. | [ux] |

### react-native-imported-from-its-entry → dependency-reached-through-its-public-entry · MUST
React Native is imported from `react-native`, never from its internal paths.

| Why | Tags |
|---|---|
| the internal paths of React Native move between releases, and the linter refuses them. | [] |
