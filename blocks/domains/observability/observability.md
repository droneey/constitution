---
id: observability
summary: Logs, traces and metrics the people who operate a program read.
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**"]
---

# Observability

> A program whose people follow what it does from outside: one pipeline masks, enriches and renders every log record, every unit of work is a span of a trace that crosses systems, what the program serves is measured by its rate, errors and duration, and every signal names the service that sent it.

## Signals

### signal-carries-the-service-identity · SHOULD

Every log record, span and metric carries the identity of the service that wrote it — its name, its version and its environment — named as OpenTelemetry's semantic conventions name them.

| Why | Tags |
|---|---|
| signals of several services and releases meet in one collector, and one without them cannot be traced to the code that wrote it. | [] |

### signals-emitted-through-opentelemetry · SHOULD

Spans and metrics are emitted through OpenTelemetry's API, logs through the program's logger, bridged to it or collected from its output, and every signal reaches the backend over OTLP; and a measure a stable semantic convention names — `http.server.request.duration` — takes that name, its unit and its attributes.

| Why | Tags |
|---|---|
| one vendor-neutral API and protocol let the backend change with no change of code and let libraries instrument themselves, and the conventions' names make two services of one project measure alike. | [] |
