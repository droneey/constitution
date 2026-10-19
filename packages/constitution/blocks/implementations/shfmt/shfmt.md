---
id: shfmt
summary: shfmt formats shell scripts.
requires: [shell]
extends: null
abstract: false
languages: [shell]
dictionary: [shfmt]
governs: []
---

# shfmt

> Formats shell.

shfmt reads its options from `.editorconfig`, which starts from the template `templates/project/common/core/.editorconfig` of the Constitution's release archive; an option given as a flag makes it ignore that file.
