---
id: observability
summary: "Logs a collector reads: one pipeline, events with fields, trace ids."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---

# Observability

> A program whose log records a collector reads, so that the people who operate it can follow what it does: one pipeline masks, enriches and renders every record, a record is an event with its values as fields, and the trace id ties together the records of one unit of work. Where logging is configured is in `architecture/`.
