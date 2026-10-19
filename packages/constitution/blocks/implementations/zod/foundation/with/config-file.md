# Config file

> Governs the schema of the config file, published for its editors.

## General

### json-schema-from-zod → published-schema-generated-from-code · MUST

The published JSON Schema is built by `z.toJSONSchema` from the config file's schema.

| Why | Tags |
|---|---|
| the schema editors read then comes from the code, and cannot drift from it. | [] |
