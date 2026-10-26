---
id: editorconfig
summary: Editor and formatter settings, shared through one file.
requires: []
extends: null
abstract: false
languages: []
governs: [".editorconfig"]
---

# EditorConfig

> **EditorConfig**, set by **`.editorconfig`**{#editor-settings}, gives every editor and every formatter that reads it the indent, the line ending and the charset.

`constitution` writes two spaces, LF and UTF-8 for every file into it, and `root = true`, so no file above the repository applies.
