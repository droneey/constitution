---
id: yamlfmt
summary: yamlfmt formats YAML files.
requires: [yaml]
extends: null
abstract: false
languages: [yaml]
dictionary: [yamlfmt, .yamlfmt.yaml]
governs: [".yamlfmt.yaml"]
---

# yamlfmt

> Formats YAML. It extends no file, so `.yamlfmt.yaml` at the project's root is a copy of `presets/yaml/yamlfmt/self.yaml` of the Constitution's release archive: the basic formatter, which keeps single blank lines and folded scalars as written, drops the `!!merge` tag, writes every sequence in block style and skips the files version control ignores.

### yamlfmt-is-the-formatter → one-formatter-per-language · MUST

yamlfmt formats every YAML file.

| Why | Tags |
|---|---|
| one formatter for YAML ends every argument about its layout. | [] |
