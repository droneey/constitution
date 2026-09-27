---
id: react-native
kind: implementation
summary: React on a device — host components, virtualised lists, modules.
chapters: []
requires: [mobile]
extends: _react
abstract: false
checks: []
owns: [React Native]
governs: ["**/*.tsx"]
status: stable
---

# React Native

> React rendering to a phone's or tablet's native views. Written thin: its host components, accessibility props, gestures and safe areas get their rules with the first mobile project.

## long-lists-virtualised · SHOULD
A list that can grow renders through a virtualised list, never `map` inside a scroll view.
**Why:** a mapped list mounts every row at once, and a long one freezes the device.
**Check:** review
**Tags:** performance

## react-native-entry-imports-only · MUST
React Native is imported only from its package entry, never from its internal paths.
**Why:** internal paths change between releases without notice, and break the app on an update.
**Check:** tool — lint
**Tags:** architecture
