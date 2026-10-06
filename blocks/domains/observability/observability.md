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

> How the program writes its log records, in any language: one pipeline masks, enriches and renders every record, and a record is an event with its values as fields.

### log-records-pass-one-pipeline → secret-and-personal-data-kept-out-of-output
Every log record — the program's, its libraries' and its server's — passes one pipeline that enriches, masks and renders it.

| Why | Tags |
|---|---|
| a record that bypasses the pipeline skips the mask and the trace id, and lands in a second format nobody parses. | [security] |

### log-secrets-masked-by-key → secret-and-personal-data-kept-out-of-output
The log pipeline replaces the value of every key the project lists as secret — such as `password`, `token`, `authorization`, `cookie` and `secret` — compared without case and at any depth, before any output.

| Why | Tags |
|---|---|
| a secret passed as a field by mistake is masked whichever code wrote it, while a mask of exact paths misses the key that arrives in another case or one level deeper. | [security] |

### log-record-is-an-event-with-fields · SHOULD
A log record's message is a fixed phrase that names what happened, and its values travel as fields beside it; nothing is formatted into the message.

| Why | Tags |
|---|---|
| a fixed message is counted and searched as one event and a field is filtered by its value, while a formatted message is a new string every time. | [] |

### log-output-structured-in-production · SHOULD
The program writes one structured object per log record in production, and readable lines in development, as a setting read at the program's start chooses, never a guess from the terminal.

| Why | Tags |
|---|---|
| a collector parses one object per record and a person reads lines; a guess from the terminal picks wrongly when a person pipes the output or a container gives the program a terminal. | [] |

### log-records-carry-the-trace-id · SHOULD
Every log record a unit of work — a request, a task, a message — writes carries its trace id: the caller's, or a new one, bound once at the unit's start through the runtime's context and never passed down by hand.

| Why | Tags |
|---|---|
| the records of one unit are then found together, across every function and library it passes through, while an id passed by hand is lost at the first call that does not take it. | [] |
