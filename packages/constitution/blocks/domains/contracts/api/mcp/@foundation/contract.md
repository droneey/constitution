# Contract

> Governs how a tool is defined for a language model, how its definition and its list stay stable, and the spec that pins them.

## Vocabulary

A **tool server** is a program that serves tools over the Model Context Protocol: functions a language model calls through its client, which core's tools chapter counts as no tool. A tool server's contract is the list of tools it serves, with their schemas and annotations.

## Definition

### tool-described-for-the-model · SHOULD

Every tool's definition says what the tool does, when to call it and what it returns.

| Why |
|---|
| a language model chooses a tool from its definition alone, so what the definition leaves out becomes a wrong call. |

### tool-parameter-described-for-the-model · MUST

Every parameter of a tool says what it holds, in what format and in what unit.

| Why |
|---|
| a language model fills an argument from its parameter's description alone, so a format or a unit the description leaves out becomes a wrong argument. |

### tool-declares-its-effects · MUST

Every tool declares `readOnlyHint`, `destructiveHint`, `idempotentHint` and `openWorldHint` explicitly, never leaving one to its default.

| Why |
|---|
| clients decide from these hints which calls a person confirms, and a missing one falls back to a default that may not fit the tool. |

### tool-effect-hint-never-safer-than-the-tool · MUST

No effect hint a tool declares makes the tool look safer than it is.

| Why |
|---|
| a client lets a call it believes safe run unconfirmed, so a wrong hint runs a destructive call no person approved. |

### tool-name-opens-with-its-area · SHOULD

Every tool's name opens with the area it belongs to.

| Why |
|---|
| a client that gathers tools from several servers prefixes their names itself, by a server name that need not be unique, so a name that opens with its area is what keeps two alike tools apart in the language model's context, which otherwise calls the wrong one — the MCP specification (2026-07-28). |

### tool-input-schema-closed → own-shape-parsed-strictly · MUST

Every tool's `inputSchema` refuses an argument it does not declare, by `additionalProperties: false`, or by `unevaluatedProperties: false` where the schema composes others.

| Why |
|---|
| a language model invents arguments, and an open schema that drops an invented filter lets the model believe the filter was applied. |

### tool-argument-bounded-by-its-schema → request-bounded-in-what-it-asks · MUST

Every argument a tool's `inputSchema` declares is bounded by its type, by its range or its values, and by its length.

| Why |
|---|
| a language model fills an unbounded argument with whatever it imagines, and the server spends what the model chose. |

### model-reached-data-served-as-a-tool · SHOULD

Everything a tool server lets a language model reach alone is served through a tool. The tool hands it in its answer or in a resource its answer links to. A resource or a prompt alone serves only what the host or the user chooses.

| Why |
|---|
| the host attaches resources and the user picks prompts, so a language model whose client loads only tools never sees them. |

## Stability

### tool-list-stable-in-order · SHOULD

Every tool server's list of tools stays the same, in the same order, while its code and its caller's grants are unchanged.

| Why |
|---|
| clients cache the list, and a reordered list misses the language model's prompt cache on every call. |

### tool-definition-fixed-by-the-release · MUST

Every tool's definition changes only with a release. Its name, description, schemas and annotations come from the program's code; none is built from stored data, a caller's input or anything fetched at run time.

| Why |
|---|
| a language model obeys what a description says, so a description built from data lets that data steer the model, and lets a definition change after it was approved. |

### server-instructions-fixed-by-the-release · MUST

Every tool server's instructions change only with a release. They come from the program's code, never built from stored data, a caller's input or anything fetched at run time.

| Why |
|---|
| a client hands the server's instructions to the language model as guidance it obeys, so instructions built from data let that data steer the model past what was approved. |

## Proof

### tool-list-pinned-by-a-spec · MUST

Every tool server's list of tools is pinned by a spec. The list it pins holds the tools' names, descriptions, schemas and annotations.

| Why |
|---|
| a description is the prompt every client sends, so a change to it that no diff shows changes how every language model calls the tool, unreviewed, while a pinned list shows every change to what language models read as a diff. |
