# Layout

> Governs a YAML file's name: its extension.

## Names

### yaml-file-ends-in-yaml → format-has-one-extension · MUST

Every YAML file ends in `.yaml`, never `.yml`. Exempt: a file a tool reads only by a fixed name.

| Why |
|---|
| two spellings split every glob, tool and reader that looks for YAML files, so a file in the other spelling goes unchecked, and `.yaml` is the one the format's own site asks for — the YAML FAQ. |
