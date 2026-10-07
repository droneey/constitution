# Answers

> Governs a tool's answer and its failures.

## Failures

### tool-failure-answered-as-an-error-result → failure-answered-by-its-code · MUST
A refused argument and an expected failure are answered as a tool result with `isError: true`, carrying the failure's code and a text naming what to change; only an unknown tool or a request that breaks the protocol gets a protocol error.

| Why | Tags |
|---|---|
| a client shows a tool's error to the model so that it corrects itself, but may hide a protocol error from it. | [errors] |

## Size

### tool-answer-bounded-for-the-context → answer-bounded-in-size · MUST
A tool's answer is bounded by a maximum the project sets in tokens or characters, far below a model's context window; an answer cut to it says so, and either says how to narrow the call or carries the cursor of the rest.

| Why | Tags |
|---|---|
| an unbounded answer fills the model's context and pushes out its task, and a silent cut makes it believe it saw everything. | [performance] |

## Content

### tool-answer-carries-the-identifiers-the-next-tool-takes · SHOULD
An item in a tool's answer carries the identifier the tools acting on it accept, and a human-readable name beside it.

| Why | Tags |
|---|---|
| a model chains tools only through the values one answer hands to the next call. | [] |

### tool-data-answer-structured-by-its-output-schema · SHOULD
A tool that answers with data declares an `outputSchema`, returns `structuredContent` that conforms to it, and the same JSON as text.

| Why | Tags |
|---|---|
| the client validates and parses the answer instead of guessing at prose, and a client that predates structured content still reads the text. | [] |

### outside-text-in-an-answer-kept-as-data · SHOULD
Text a tool returns that others wrote — a page, a document, a message — travels only in a field of its structured answer that names its source, never spliced into the tool's own wording.

| Why | Tags |
|---|---|
| text others wrote can carry instructions, and a named field lets the client and the model tell it from the server's own words. | [security] |

### tool-answer-enumeration-open-in-its-schema → answer-enumeration-declared-open · MUST
An enumeration in a tool's output schema is a string whose known values its description names, never a closed `enum`.

| Why | Tags |
|---|---|
| clients validate an answer against its schema, and a closed `enum` fails the client on the first value added. | [] |
