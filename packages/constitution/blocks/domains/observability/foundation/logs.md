# Logs

> Governs a log record and its pipeline.

## The pipeline

### log-record-passes-one-pipeline → diagnostics-written-through-a-logger · MUST

Every log record passes one pipeline. The program's records, its libraries' and its server's all pass it, and it enriches, masks and renders each.

| Why |
|---|
| a record that bypasses the pipeline skips the mask and the trace id, and lands in a second format nobody parses. |

## Records

### log-record-is-an-event-with-fields · SHOULD

A log record is an event with fields. Its message is a fixed phrase that names what happened, and its values travel as fields beside it; nothing is formatted into the message.

| Why |
|---|
| a value formatted into the message makes a new string of every record, so one event can no longer be counted or searched as one and its values cannot be filtered — structured logging. |

### log-record-of-a-failure-carries-its-code-and-cause · SHOULD

A log record of a failure carries its code and its cause. The failure's code, its chain of causes and its stack travel as fields of the record.

| Why |
|---|
| an operator counts failures by their code and finds the bug from the cause and the stack, and a failure logged by its message alone gives neither. |

### log-record-carries-the-trace-id · SHOULD

Every log record carries the trace id of its unit of work, without its logging call adding it. The unit — a request, a task, a message — binds the id once at its start, in the runtime's context or in the context value its language passes explicitly, and the pipeline writes it into each record.

| Why |
|---|
| a record without its trace id cannot be found with the other records of its unit across the functions and libraries it passed through, and an id each logging call must add is lost at the first call that does not add it. |

### log-level-has-one-meaning · SHOULD

A log level has one meaning: what its reader must do. An error says that someone acts; a warning, that the work degraded and may need action; info, a step of normal work; debug, detail for a developer, off in production.

| Why |
|---|
| an error logged for what needs no action pages someone for nothing, until the alert on errors is ignored and a real one is missed. |

## Output

### log-output-structured-in-production · SHOULD

The log is structured in production and readable in development. A setting read at the program's start chooses between one structured object per record and readable lines.

| Why |
|---|
| a collector cannot parse lines meant for a person, and a person cannot read objects meant for a collector, so one form everywhere fails one of them. |
