# Imports

> Governs the entry React Native is imported from.

## General

### react-native-imported-from-its-entry → dependency-reached-through-its-public-entry · MUST

React Native is imported from `react-native`, never from its internal paths.

| Why |
|---|
| the internal paths of React Native move between releases, and the linter refuses them. |
