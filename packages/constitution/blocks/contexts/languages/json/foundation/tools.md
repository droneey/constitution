# Tools

> Governs the tools that read a JSON configuration: the schema it names for them.

## Schema

### json-configuration-names-its-schema → configuration-names-its-schema · SHOULD

A configuration written in JSON names its reader's schema in `$schema`, where the reader accepts the key.

| Why |
|---|
| the key is where JSON tools look for a schema. |
