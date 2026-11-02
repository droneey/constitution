# Signals

> Governs what every signal carries and what it masks, how it is emitted and named, and how it is flushed.

## General

### signal-carries-the-service-identity · SHOULD

Every signal carries the identity of the service that wrote it. Each log record, span and metric carries the service's name, its version and its environment.

| Why |
|---|
| signals of several services and releases meet in one collector, and one without them cannot be traced to the code that wrote it. |

### signals-emitted-through-opentelemetry · SHOULD

Signals are emitted through OpenTelemetry and reach the backend over OTLP. Spans and metrics are emitted through OpenTelemetry's API, and logs through the program's logger, bridged to it or collected from its output.

| Why |
|---|
| signals emitted through a vendor's own API or protocol tie every instrumented line to that vendor, so a change of backend is a change of code, and the libraries that instrument themselves through OpenTelemetry go unseen — OpenTelemetry. |

### signal-named-by-the-semantic-conventions · SHOULD

A signal takes the name a stable semantic convention of OpenTelemetry gives it. A measure, an attribute or a resource such a convention names — `http.server.request.duration`, `service.name` — takes that name, its unit and its attributes.

| Why |
|---|
| a measure named its own way differs between two services of one project, and every backend needs a mapping of its own before it can read it — OpenTelemetry's semantic conventions. |

### signals-flushed-before-exit → program-stops-cleanly · MUST

Signals are flushed before the program exits. A program told to stop flushes the log records, spans and metrics it holds in buffers before it exits, within the bound of its stop.

| Why |
|---|
| the signals of the last seconds, often the ones that explain the stop, are otherwise lost with the process. |

## Masking

### signal-value-masked-by-its-key → secret-kept-out-of-output · MUST

A signal's value is masked by its key before any output or export, and an address or a statement by its form. The value of every key of a signal — a log record's field, a span's attribute, a metric's exemplar — that holds the words of a name the project lists as secret, such as `password`, `token`, `api key`, `private key`, `authorization`, `cookie` and `secret`, is replaced at any depth, a key's words found across its case and separators and compared as whole words. An address is recorded without its query, and a database statement only with placeholders for its values.

| Why |
|---|
| a secret passed as a field by mistake is masked whichever code wrote it, while a mask of exact keys misses a key that only holds a secret's name among other words, and one of substrings masks the counts of tokens a span must carry; instrumentation records the full address and the statement's text by default, so a mask on logs alone leaves the same secret in every trace. |
