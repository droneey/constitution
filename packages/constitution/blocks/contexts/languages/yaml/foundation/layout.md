# Layout

> Governs a YAML file's name: its extension.

## Names

### yaml-file-ends-in-yaml → format-has-one-extension · SHOULD

A YAML file ends in `.yaml`, never `.yml`. That is the extension YAML's own site asks for, and a file a tool reads only by a fixed name is exempt.

| Why |
|---|
| two spellings split every glob, tool and reader that looks for YAML files, so a file in the other spelling goes unchecked; a name a tool fixes is not the project's to choose. |
