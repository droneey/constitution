# Tools

> Governs the tools that read a JSON configuration: the schema it names for them.

## Schema

### json-configuration-names-its-schema → configuration-names-its-schema · SHOULD

A configuration written in JSON names its reader's schema in `$schema`. This holds where the reader accepts the key.

| Why |
|---|
| a schema named anywhere else is not found by JSON tools, so an editor checks and completes the file against nothing. |
