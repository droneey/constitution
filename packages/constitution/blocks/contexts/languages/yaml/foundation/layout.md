# Layout

> Governs a YAML file's extension and its documents.

## Kinds

### yaml-file-holds-one-document · SHOULD

A YAML file holds one document, save where its format reads a stream of several, as Kubernetes manifests do.

| Why |
|---|
| a reader that expects one document fails on the second or reads only the first, and a schema describes one document. |

## Names

### yaml-file-ends-in-yaml → format-has-one-extension · SHOULD

A YAML file ends in `.yaml`, the extension YAML's own site asks for, never `.yml`, save a file a tool reads only by a fixed name.

| Why |
|---|
| one spelling lets every glob, tool and reader find every YAML file, and a name a tool fixes is not the project's to choose. |
