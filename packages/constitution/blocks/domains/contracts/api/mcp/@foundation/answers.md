# Answers

> Governs a tool's answer and its failures.

## Failures

### tool-failure-answered-as-an-error-result → failure-answered-by-its-code · MUST

Every refused argument and expected failure of a tool is answered as a tool result with `isError: true`, never as a protocol error. It carries the failure's code and a text naming what to change.

| Why |
|---|
| a client shows a tool's error to the language model so that it corrects itself, but may hide a protocol error from it, so a failure sent as one leaves the model to retry blind. |

### tool-defect-answered-as-an-error-result → defect-answered-as-an-internal-error · MUST

Every defect of a tool call is answered as a tool result with `isError: true` that names it an internal error, never as a protocol error. Exempt: a defect that strikes before the call reaches its tool, which is answered with the protocol's internal error, `-32603`.

| Why |
|---|
| a client may hide a protocol error from the language model, which then retries blind, while a result that names an internal error tells the model the call failed through no fault of its arguments — the MCP specification has clients give the model its tool execution errors, API failures among them, and only allows them to give it protocol errors. |

### unknown-tool-answered-as-a-protocol-error → framework-refusal-answered-as-the-callers-failure · MUST

Every unknown tool's call, and every request that breaks the protocol, gets a protocol error, never a tool result.

| Why |
|---|
| a call the server cannot route reached no tool, so no tool result can carry it, and the protocol's own error is what every client reads for it. |

## Size

### tool-answer-bounded-for-the-context → answer-bounded-in-size · MUST

Every tool answer is bounded far below a language model's context window, in tokens or characters, by a maximum the project sets.

| Why |
|---|
| an answer that fills the language model's context pushes out its task. |

## Content

### tool-answer-carries-the-identifiers-the-next-tool-takes · SHOULD

Every item in a tool's answer carries the identifier the tools acting on it accept.

| Why |
|---|
| a language model chains tools only through the values one answer hands to the next call, so an item without its identifier leaves the model to guess one or to ask again. |

### tool-answer-item-carries-a-readable-name · SHOULD

Every item in a tool's answer carries a human-readable name beside its identifier.

| Why |
|---|
| a language model tells its person which item it acted on only by a name the person knows, so an identifier alone leaves it to guess or to show the person a code. |

### tool-data-answer-structured-by-its-output-schema · SHOULD

Every tool that answers with data declares an `outputSchema` and returns `structuredContent` that conforms to it.

| Why |
|---|
| without the schema the client guesses at prose, where it could validate and parse the answer. |

### structured-tool-answer-repeated-as-text · SHOULD

Every tool answer that carries `structuredContent` carries the same JSON as text too.

| Why |
|---|
| a client that predates structured content reads only the text, and reads nothing of an answer that has none. |

### outside-text-in-an-answer-kept-as-data · MUST

All text others wrote travels in a tool's answer only as data, never spliced into the tool's own wording. It sits in a part of the answer of its own that names its source, a field of the structured answer where the tool has one. Such text includes a page, a document and a message.

| Why |
|---|
| text others wrote can carry instructions, and spliced into the server's own words it reads to the client and the language model as the server's. |
