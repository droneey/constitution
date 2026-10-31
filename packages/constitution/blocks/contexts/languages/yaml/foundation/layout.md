# Layout

> Governs a YAML file's name: its extension.

## Names

### yaml-file-ends-in-yaml → format-has-one-extension · SHOULD

A YAML file ends in `.yaml`, the extension YAML's own site asks for, never `.yml`, save a file a tool reads only by a fixed name.

| Why |
|---|
| one spelling lets every glob, tool and reader find every YAML file, and a name a tool fixes is not the project's to choose. |
