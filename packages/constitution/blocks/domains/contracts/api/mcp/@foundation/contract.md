# Contract

> Governs how a tool is defined for a language model, how its definition and its list stay stable, and the spec that pins them.

## Vocabulary

A **tool server** is a program that serves tools over the Model Context Protocol: functions a language model calls through its client, which core's tools chapter counts as no tool. A tool server's contract is the list of tools it serves, with their schemas and annotations.

## Definition

### tool-described-for-the-model · SHOULD

Every tool's definition says what the tool does, when to call it and what it returns.

#### Why

A language model chooses a tool from its definition alone, so what the definition leaves out becomes a wrong call.

#### Examples

```text title="Avoid"
{
  "name": "orders_list",
  "description": "Gets orders."
}
```

```text title="Prefer"
{
  "name": "orders_list",
  "description": "Lists the signed-in customer's orders, newest first. Call it to find an order before tracking, cancelling or returning it. Returns up to 20 orders, each with its orderId, number, status and total."
}
```

### tool-parameter-described-for-the-model · MUST

Every parameter of a tool says what it holds, in what format and in what unit.

#### Why

A language model fills an argument from its parameter's description alone, so a format or a unit the description leaves out becomes a wrong argument.

#### Examples

```text title="Avoid"
"properties": {
  "placedAfter": { "type": "string" },
  "amount": { "type": "integer" }
}
```

```text title="Prefer"
"properties": {
  "placedAfter": {
    "type": "string",
    "description": "Earliest time an order was placed, as an ISO 8601 date-time in UTC, such as 2026-11-01T00:00:00Z."
  },
  "amount": {
    "type": "integer",
    "description": "Amount to refund, in minor units of the order's currency, such as 1250 for 12.50 EUR."
  }
}
```

### tool-declares-its-effects · MUST

Every tool declares `readOnlyHint`, `destructiveHint`, `idempotentHint` and `openWorldHint` explicitly, never leaving one to its default.

#### Why

Clients decide from these hints which calls a person confirms, and a missing one falls back to a default that may not fit the tool.

#### Examples

```text title="Avoid"
{
  "name": "orders_refund",
  "annotations": {
    "destructiveHint": true
  }
}
```

```text title="Prefer"
{
  "name": "orders_refund",
  "annotations": {
    "readOnlyHint": false,
    "destructiveHint": true,
    "idempotentHint": false,
    "openWorldHint": true
  }
}
```

### tool-effect-hint-never-safer-than-the-tool · MUST

No effect hint a tool declares makes the tool look safer than it is.

#### Why

A client lets a call it believes safe run unconfirmed, so a wrong hint runs a destructive call no person approved.

#### Examples

```text title="Avoid"
{
  "name": "orders_cancel",
  "annotations": {
    "readOnlyHint": false,
    "destructiveHint": false,
    "idempotentHint": true,
    "openWorldHint": false
  }
}
```

```text title="Prefer"
{
  "name": "orders_cancel",
  "annotations": {
    "readOnlyHint": false,
    "destructiveHint": true,
    "idempotentHint": true,
    "openWorldHint": false
  }
}
```

### tool-name-opens-with-its-area · SHOULD

Every tool's name opens with the area it belongs to.

#### Why

A client that gathers tools from several servers prefixes their names itself, by a server name that need not be unique, so a name that opens with its area is what keeps two alike tools apart in the language model's context, which otherwise calls the wrong one — the MCP specification (2026-07-28).

#### Examples

```text title="Avoid"
search
cancel
get_status
```

```text title="Prefer"
orders_search
orders_cancel
shipments_get_status
```

### tool-input-schema-closed → own-shape-parsed-strictly · MUST

Every tool's `inputSchema` refuses an argument it does not declare, by `additionalProperties: false`, or by `unevaluatedProperties: false` where the schema composes others.

#### Why

A language model invents arguments, and an open schema that drops an invented filter lets the model believe the filter was applied.

#### Examples

```text title="Avoid"
"inputSchema": {
  "type": "object",
  "properties": {
    "status": { "type": "string", "enum": ["open", "shipped", "cancelled"] }
  }
}
```

```text title="Prefer"
"inputSchema": {
  "type": "object",
  "properties": {
    "status": { "type": "string", "enum": ["open", "shipped", "cancelled"] }
  },
  "additionalProperties": false
}
```

### tool-argument-bounded-by-its-schema → request-bounded-in-what-it-asks · MUST

Every argument a tool's `inputSchema` declares is bounded by its type, by its range or its values, and by its length.

#### Why

A language model fills an unbounded argument with whatever it imagines, and the server spends what the model chose.

#### Examples

```text title="Avoid"
"properties": {
  "query": { "type": "string" },
  "limit": { "type": "integer" }
}
```

```text title="Prefer"
"properties": {
  "query": { "type": "string", "minLength": 1, "maxLength": 200 },
  "limit": { "type": "integer", "minimum": 1, "maximum": 50 }
}
```

### model-reached-data-served-as-a-tool · SHOULD

Everything a tool server lets a language model reach alone is served through a tool. The tool hands it in its answer or in a resource its answer links to. A resource or a prompt alone serves only what the host or the user chooses.

#### Why

The host attaches resources and the user picks prompts, so a language model whose client loads only tools never sees them.

#### Examples

```text title="Avoid"
resources/list
  { "uri": "policies://returns", "name": "Returns policy" }

tools/list
  { "name": "orders_start_return", ... }
```

```text title="Prefer"
resources/list
  { "uri": "policies://returns", "name": "Returns policy" }

tools/list
  { "name": "orders_start_return", ... }
  { "name": "policies_get_returns", ... }

policies_get_returns answer
{
  "content": [{
    "type": "resource_link",
    "uri": "policies://returns",
    "name": "Returns policy"
  }]
}
```

## Stability

### tool-list-stable-in-order · SHOULD

Every tool server's list of tools stays the same, in the same order, while its code and its caller's grants are unchanged.

#### Why

Clients cache the list, and a reordered list misses the language model's prompt cache on every call.

#### Examples

```pseudo title="Avoid"
function listTools(context)
  return registeredTools
    .filter(tool => context.grants.allow(tool.name))
    .sortBy(tool => toolUsage.callsToday(tool.name))
```

```pseudo title="Prefer"
function listTools(context)
  return registeredTools
    .filter(tool => context.grants.allow(tool.name))
    .sortBy(tool => tool.name)
```

### tool-definition-fixed-by-the-release · MUST

Every tool's definition changes only with a release. Its name, description, schemas and annotations come from the program's code; none is built from stored data, a caller's input or anything fetched at run time.

#### Why

A language model obeys what a description says, so a description built from data lets that data steer the model, and lets a definition change after it was approved.

#### Examples

```pseudo title="Avoid"
function productsSearchDefinition()
  return {
    name: "products_search",
    description: "Searches the catalogue. " + promotions.todaysBanner(),
  }
```

```pseudo title="Prefer"
let productsSearchDefinition = {
  name: "products_search",
  description: "Searches the catalogue by name or SKU. Returns up to 20 products, each with its productId, name and price.",
}
```

### server-instructions-fixed-by-the-release · MUST

Every tool server's instructions change only with a release. They come from the program's code, never built from stored data, a caller's input or anything fetched at run time.

#### Why

A client hands the server's instructions to the language model as guidance it obeys, so instructions built from data let that data steer the model past what was approved.

#### Examples

```pseudo title="Avoid"
let server = createToolServer({
  name: "shop",
  instructions: settings.get("tool_server_instructions"),
})
```

```pseudo title="Prefer"
let shopInstructions = "Find an order with orders_search before acting on it. Refunds wait for the person's approval."

let server = createToolServer({
  name: "shop",
  instructions: shopInstructions,
})
```

## Proof

### tool-list-pinned-by-a-spec · MUST

Every tool server's list of tools is pinned by a spec. The list it pins holds the tools' names, descriptions, schemas and annotations.

#### Why

A description is the prompt every client sends, so a change to it that no diff shows changes how every language model calls the tool, unreviewed, while a pinned list shows every change to what language models read as a diff.

#### Examples

```pseudo title="Avoid"
test "should serve the shop's tools"
  # Arrange
  let client = connect(createShopToolServer(fakeAdapters))
  # Act
  let tools = client.listTools()

  # Assert
  assert tools.length is 6
```

```pseudo title="Prefer"
test "should serve the shop's tools"
  # Arrange
  let client = connect(createShopToolServer(fakeAdapters))
  # Act
  let tools = client.listTools()

  # Assert
  assert tools matches snapshot "shop-tools.json"
```
