# Schema

> Governs the schema published for editors.

## General

### published-schema-generated-from-code → generated-file-never-edited · MUST

Where the config file's format has a schema editors read — JSON Schema for JSON, YAML and TOML — the schema published for editors is generated from the program's schema of the config file, never written by hand, and the copy the project commits is compared by a spec with a fresh generation and differs in nothing.

| Why |
|---|
| a schema written twice drifts, and editors then accept files the program rejects; a stale copy is what editors fetch, and only a spec notices that the code's schema moved on without it. |

### config-file-points-editors-at-the-schema · SHOULD

The config file points editors at its published schema, where its format has one.

| Why |
|---|
| the editor then checks and completes the config file as it is written. |

## Requirements for implementation

### schema-library-generates-the-editors-schema · MUST

The schema library generates, from the program's schema, the schema editors read for the config file's format, where it has one — JSON Schema for JSON, YAML and TOML.

| Why |
|---|
| without it, the schema editors read cannot come from the code, and drifts. |
