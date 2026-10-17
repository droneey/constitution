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

> Formats shell. It reads its options from `.editorconfig`, which starts from the template `templates/project/core/.editorconfig` of the constitution's release archive; an option given as a flag makes it ignore that file.

### shfmt-is-the-formatter → one-formatter-per-language · MUST

shfmt formats every shell script with the options `.editorconfig` sets: two spaces, and the branches of a `case` indented.

| Why | Tags |
|---|---|
| one formatter for shell ends every argument about its layout. | [] |
