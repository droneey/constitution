# Signals

> Governs what every signal carries, how it is emitted and how it is flushed.

## General

### signal-carries-the-service-identity · SHOULD

Every log record, span and metric carries the identity of the service that wrote it — its name, its version and its environment — named as OpenTelemetry's semantic conventions name them.

| Why |
|---|
| signals of several services and releases meet in one collector, and one without them cannot be traced to the code that wrote it. |

### signals-emitted-through-opentelemetry · SHOULD

Spans and metrics are emitted through OpenTelemetry's API, logs through the program's logger, bridged to it or collected from its output, and every signal reaches the backend over OTLP; and a measure a stable semantic convention names — `http.server.request.duration` — takes that name, its unit and its attributes.

| Why |
|---|
| one vendor-neutral API and protocol let the backend change with no change of code and let libraries instrument themselves, and the conventions' names make two services of one project measure alike. |

### signals-flushed-before-exit → program-stops-cleanly · MUST

A program told to stop flushes the log records, spans and metrics it holds in buffers before it exits, within the bound of its stop.

| Why |
|---|
| the signals of the last seconds, often the ones that explain the stop, are otherwise lost with the process. |
