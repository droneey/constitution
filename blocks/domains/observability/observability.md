---
id: observability
summary: Logs, traces and metrics the people who operate a program read.
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---
# Observability

> A program whose people follow what it does from outside: one pipeline masks, enriches and renders every log record, every unit of work is a span of a trace that crosses systems, what the program serves is measured by its rate, errors and duration, and every signal names the service that sent it. Where logging is configured is in `architecture/`.

## Signals

### signal-carries-the-service-identity · SHOULD
Every log record, span and metric carries the identity of the service that wrote it — its name, its version and its environment — named as OpenTelemetry's semantic conventions name them.

| Why | Tags |
|---|---|
| signals of several services and releases meet in one collector, and one without them cannot be traced to the code that wrote it. | [] |
