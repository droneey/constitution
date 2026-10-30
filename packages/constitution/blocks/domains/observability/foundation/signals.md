# Signals

> Governs what every signal carries and what it masks, how it is emitted and named, and how it is flushed.

## General

### signal-carries-the-service-identity · SHOULD

Every log record, span and metric carries the identity of the service that wrote it: its name, its version and its environment.

| Why |
|---|
| signals of several services and releases meet in one collector, and one without them cannot be traced to the code that wrote it. |

### signals-emitted-through-opentelemetry · SHOULD

Spans and metrics are emitted through OpenTelemetry's API, logs through the program's logger, bridged to it or collected from its output, and every signal reaches the backend over OTLP.

| Why |
|---|
| one vendor-neutral API and protocol let the backend change with no change of code and let libraries instrument themselves. |

### signal-named-by-the-semantic-conventions · SHOULD

A measure, an attribute or a resource that a stable semantic convention of OpenTelemetry names — `http.server.request.duration`, `service.name` — takes that name, its unit and its attributes.

| Why |
|---|
| the conventions' names make two services of one project measure alike, and a backend reads them without a mapping of its own. |

### signals-flushed-before-exit → program-stops-cleanly · MUST

A program told to stop flushes the log records, spans and metrics it holds in buffers before it exits, within the bound of its stop.

| Why |
|---|
| the signals of the last seconds, often the ones that explain the stop, are otherwise lost with the process. |

## Masking

### signal-value-masked-by-its-key → secret-kept-out-of-output · MUST

Before any output or export, the value of every key of a signal — a log record's field, a span's attribute, a metric's exemplar — that holds the words of a name the project lists as secret or personal — such as `password`, `token`, `api key`, `private key`, `authorization`, `cookie`, `secret`, `email` and `phone` — is replaced, the words compared as whole words, at any depth: `refreshToken`, `apiKey` and `user_email` are masked, `input_tokens` is not. An address is recorded without its query, and a database statement only with placeholders for its values.

| Why |
|---|
| a secret or a person's data passed as a field by mistake is masked whichever code wrote it, while a mask of exact keys misses `refreshToken` and one of substrings masks the counts of tokens a span must carry; instrumentation records the full URL and the statement's text by default, so a mask on logs alone leaves the same secret in every trace. |
