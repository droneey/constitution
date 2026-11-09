---
id: shfmt
summary: shfmt formats shell scripts.
requires: [shell, task-runner]
languages: [shell]
governs: []
---

# shfmt

> shfmt, the `shfmt` command, formats shell code.

shfmt reads its options only from `.editorconfig`, to which its settings add `switch_case_indent` for shell files; an option given as a flag makes it ignore that file.
