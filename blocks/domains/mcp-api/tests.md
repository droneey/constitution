# Tests

> Governs the specs of a tool server.

## Definitions

### tool-list-pinned-by-a-spec → contract-published-machine-readable · MUST
The contract of a tool server is what it lists — the tools' names, descriptions, schemas and annotations — pinned by a spec, so a change to what models read shows as a diff in review.

| Why | Tags |
|---|---|
| a description is the prompt every client sends, and a change to it changes how every model calls the tool. | [testing] |
