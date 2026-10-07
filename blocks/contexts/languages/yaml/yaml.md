---
id: yaml
summary: How YAML files are named.
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**/*.yaml", "**/*.yml"]
---

# YAML

### yaml-file-ends-in-yaml → format-has-one-extension · SHOULD
A YAML file ends in `.yaml`, the extension YAML's own documentation recommends, never `.yml`, unless a tool reads it only by a fixed name, as a code host reads its issue forms.

| Why | Tags |
|---|---|
| one spelling lets every glob, tool and reader find every YAML file, and a name a tool fixes is not the project's to choose. | [] |
