# Schema

> Governs the schema published for editors.

## General

### published-schema-generated-from-code → generated-file-never-edited · MUST

The schema published for editors is generated from the program's schema of the config file, never written by hand. This holds where the file's format has a schema editors read — JSON Schema for JSON, YAML and TOML — and the copy the project commits is compared by a spec with a fresh generation and differs in nothing.

| Why |
|---|
| a schema written twice drifts, and editors then accept files the program rejects; a stale copy is what editors fetch, and only a spec notices that the code's schema moved on without it — a single source of truth. |

## Requirements for implementation

### schema-library-generates-the-editors-schema · MUST

The schema library generates, from the program's schema, the schema editors read. It generates it for the config file's format where that format has one — JSON Schema for JSON, YAML and TOML.

| Why |
|---|
| a schema for editors written by hand drifts from the program's own, so the editor accepts a file the program refuses, or flags one it reads. |
