# Answers

> Governs a tool's answer and its failures.

## Failures

### tool-failure-answered-as-an-error-result → failure-answered-by-its-code · MUST

A tool's failure is answered as an error result. A refused argument and an expected failure are answered as a tool result with `isError: true`, carrying the failure's code and a text naming what to change; only an unknown tool or a request that breaks the protocol gets a protocol error.

| Why |
|---|
| a client shows a tool's error to the language model so that it corrects itself, but may hide a protocol error from it, so a failure sent as one leaves the model to retry blind. |

## Size

### tool-answer-bounded-for-the-context → answer-bounded-in-size · MUST

A tool's answer is bounded far below a language model's context window. It is bounded in tokens or characters by a maximum the project sets.

| Why |
|---|
| an answer that fills the language model's context pushes out its task. |

## Content

### tool-answer-carries-the-identifiers-the-next-tool-takes · SHOULD

An item in a tool's answer carries the identifier the next tool takes. It carries the identifier the tools acting on it accept, and a human-readable name beside it.

| Why |
|---|
| a language model chains tools only through the values one answer hands to the next call, so an item without its identifier leaves the model to guess one or to ask again. |

### tool-data-answer-structured-by-its-output-schema · SHOULD

A tool that answers with data answers by its output schema. It declares an `outputSchema`, returns `structuredContent` that conforms to it, and the same JSON as text.

| Why |
|---|
| without the schema the client guesses at prose instead of validating and parsing the answer, and without the text a client that predates structured content reads nothing. |

### outside-text-in-an-answer-kept-as-data · SHOULD

Text others wrote travels in a tool's answer as data. Such text — a page, a document, a message — travels only in a field of the structured answer that names its source, never spliced into the tool's own wording.

| Why |
|---|
| text others wrote can carry instructions, and spliced into the server's own words it reads to the client and the language model as the server's. |
