---
id: expo
summary: Expo on React Native — app config, native builds, secure storage.
requires: [react-native]
extends: null
abstract: false
languages: []
dictionary: [Expo, EAS, Expo Router, app.config.ts, eas.json]
governs: ["app.config.ts", "eas.json"]
---

# Expo

> React Native through Expo. Written thin, like the React Native it requires: the rest waits for the first mobile project.

### native-modules-at-sdk-versions · SHOULD
Native modules are at the versions the SDK supports.

| Why | Tags |
|---|---|
| a native module at another version builds and then crashes on a device. | [] |

### expo-router-file-names-kept → file-name-in-its-owners-case
A route keeps the names Expo Router finds it by: `_layout.tsx`, `+not-found.tsx`, a group `(tabs)/` and a parameter `[orderId].tsx`.

| Why | Tags |
|---|---|
| the router finds its layouts, groups and parameters by these names alone. | [] |
