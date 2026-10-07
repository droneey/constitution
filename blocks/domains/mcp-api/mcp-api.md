---
id: mcp-api
summary: A server of tools that models call over the Model Context Protocol.
requires: []
extends: _api
abstract: false
languages: []
dictionary: []
governs: []
---
# MCP API

> A server of tools that models call over the Model Context Protocol. Its rules bind the tools the program serves, and no other: how a tool is defined for a model, how it answers and fails, its transport, how it talks to the person, and its specs. Calling another program's tools is a remote service.

## Definitions

### tool-described-for-the-model · MUST
A tool's definition says what it does, when to call it and what it returns, and each of its parameters says what it holds, in what format and unit.

| Why | Tags |
|---|---|
| a model chooses a tool and fills its arguments from its definition alone. | [] |

### tool-declares-its-effects · MUST
A tool declares `readOnlyHint`, `destructiveHint`, `idempotentHint` and `openWorldHint` explicitly, and none of them makes the tool look safer than it is.

| Why | Tags |
|---|---|
| clients decide from these hints which calls a person confirms: a missing one falls back to a cautious default, a wrong one lets a destructive call run unconfirmed. | [security] |

### tool-name-opens-with-its-area · SHOULD
A tool's name opens with the area it belongs to — `accounting_search_articles` — and is unique on its server.

| Why | Tags |
|---|---|
| a client that holds tools from several servers tells them apart by the prefix. | [] |

### tool-name-in-the-protocols-character-set · MUST
A tool's name matches `^[A-Za-z0-9_.-]{1,128}$`.

| Why | Tags |
|---|---|
| a name outside that set travels encoded in a header, and some clients refuse it. | [] |

### tool-definition-fixed-by-the-release · MUST
A tool's name, description, schemas and annotations, and the server's instructions, come from the program's code and change only with a release; none is built from stored data, a caller's input or anything fetched at run time.

| Why | Tags |
|---|---|
| a model obeys what a description says, so a description built from data lets that data steer the model, and lets a definition change after it was approved. | [security] |

### tool-input-schema-closed → request-binds-only-declared-fields · MUST
A tool's `inputSchema` refuses an argument it does not declare: `additionalProperties: false`.

| Why | Tags |
|---|---|
| a model invents arguments, and an open schema that drops an invented filter silently lets the model believe the filter was applied. | [security] |

### tool-arguments-bounded → request-size-bounded · MUST
Each argument a tool declares is bounded in its schema — its type, its range or values, and its length.

| Why | Tags |
|---|---|
| a model fills an unbounded argument with whatever it imagines, and the server spends what the model chose. | [] |

### model-reached-data-served-as-a-tool · SHOULD
What a model must reach on its own is a tool, or a resource a tool's answer links to; a resource or a prompt alone serves what the application or the user chooses.

| Why | Tags |
|---|---|
| the host application attaches resources and the user picks prompts, so a model whose client loads only tools never sees them. | [] |

### tool-list-stable-in-order · SHOULD
The list of tools is the same, in the same order, while the server's code and the caller's grants are unchanged.

| Why | Tags |
|---|---|
| clients cache the list, and a reordered list misses the model's prompt cache on every call. | [performance] |

### changed-tool-ships-under-a-new-name → published-contract-changed-only-by-addition · MUST
A tool whose contract changes incompatibly ships under a new name beside the old one, which is then retired as the contract's rules say, since a tool server serves no two versions of one name.

| Why | Tags |
|---|---|
| a client cannot ask for a tool's older version, so a change made in place breaks every model prompted for the old one. | [] |
