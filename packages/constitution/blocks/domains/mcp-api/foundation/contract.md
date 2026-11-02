# Contract

> Governs how a tool is defined for a language model, how its definition and its list stay stable, and the spec that pins them.

## Definition

### tool-described-for-the-model · MUST

A tool's definition describes it for the language model. It says what the tool does, when to call it and what it returns, and each of its parameters says what it holds, in what format and unit.

| Why |
|---|
| a language model chooses a tool and fills its arguments from its definition alone, so what the definition leaves out becomes a wrong call or a wrong argument. |

### tool-declares-its-effects · MUST

A tool declares its effects explicitly, never as safer than they are. It declares `readOnlyHint`, `destructiveHint`, `idempotentHint` and `openWorldHint`, and none of them makes the tool look safer than it is.

| Why |
|---|
| clients decide from these hints which calls a person confirms: a missing one falls back to a cautious default, a wrong one lets a destructive call run unconfirmed. |

### tool-name-opens-with-its-area · SHOULD

A tool's name opens with the area it belongs to, and is unique on its server.

| Why |
|---|
| a client that holds tools from several servers tells them apart only by the prefix, so two servers' tools of one name collide and the language model calls the wrong one. |

### tool-input-schema-closed → request-binds-only-declared-fields · MUST

A tool's `inputSchema` is closed and bounds each argument. It refuses an argument it does not declare — `additionalProperties: false`, or `unevaluatedProperties: false` where the schema composes others — and bounds each one it declares by its type, its range or values, and its length.

| Why |
|---|
| a language model invents arguments and fills an unbounded one with whatever it imagines: an open schema that drops an invented filter lets the model believe the filter was applied, and an unbounded argument lets the server spend what the model chose. |

### model-reached-data-served-as-a-tool · SHOULD

What a language model must reach on its own is served as a tool. It is a tool, or a resource a tool's answer links to; a resource or a prompt alone serves what the host or the user chooses.

| Why |
|---|
| the host attaches resources and the user picks prompts, so a language model whose client loads only tools never sees them. |

## Stability

### tool-list-stable-in-order · SHOULD

The list of tools is the same, in the same order, while the server's code and the caller's grants are unchanged.

| Why |
|---|
| clients cache the list, and a reordered list misses the language model's prompt cache on every call. |

### tool-definition-fixed-by-the-release · MUST

A tool's definition changes only with a release. Its name, description, schemas and annotations, and the server's instructions, come from the program's code; none is built from stored data, a caller's input or anything fetched at run time.

| Why |
|---|
| a language model obeys what a description says, so a description built from data lets that data steer the model, and lets a definition change after it was approved. |

## Proof

### tool-list-pinned-by-a-spec → contract-published-machine-readable · MUST

A tool server's list is pinned by a spec. The server's contract is what it lists — the tools' names, descriptions, schemas and annotations — and the spec makes a change to what language models read show as a diff in review.

| Why |
|---|
| a description is the prompt every client sends, so a change to it that no diff shows changes how every language model calls the tool, unreviewed. |
