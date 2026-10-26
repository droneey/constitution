---
id: shfmt
summary: shfmt formats shell scripts.
requires: [shell, editorconfig]
extends: null
abstract: false
languages: [shell]
governs: []
---

# shfmt

> **`shfmt`** formats shell.

shfmt reads its options only from `.editorconfig`, to which its template adds `switch_case_indent` for shell files; an option given as a flag makes it ignore that file.
