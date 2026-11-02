# Config file

> Governs the schema of the config file, published for its editors.

## General

### json-schema-from-zod → published-schema-generated-from-code · MUST

The published JSON Schema is built by `z.toJSONSchema` from the config file's schema.

| Why |
|---|
| a JSON Schema written by hand beside the config file's schema drifts from it, so editors check the file against rules the program no longer reads — a single source of truth. |
