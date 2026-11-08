# Logs

> Governs the diagnostics the program writes, what is logged and how often, and a log record: its level, its output and the pipeline it passes.

## Vocabulary

The program's one **logging facade**{#logging-facade} is the logger through which its code writes to its log, the language's standard one where its ecosystem commonly uses it.

A **log record** is one entry the logging facade writes, with its level, its message and its fields.

## Diagnostics

### diagnostics-written-through-a-logger · MUST

Every diagnostic logged goes only through the logging facade, and no code writes to a console or a standard stream directly. Exempt: the facade's own sink, which may be a standard stream; the output of a program whose output is its interface, such as a command-line program's; and a protocol the program speaks over a stream.

| Why |
|---|
| output written past the logger escapes the one place that decides where diagnostics go and what they may carry, so it lands where nobody looks, mixes into its user's output and can leak what it prints. |

### failure-logged-once · SHOULD

Every failure is logged once, never again by each unit it passes. The unit that handles it logs it or, where that unit logs nothing, the one it reports the failure to does.

| Why |
|---|
| a failure logged by every unit it passes reads as several, and whoever reads the log chases incidents that never happened. |

### optional-part-fault-reported · MUST

Every failure contained where an optional part is called is logged there, or reported there to the unit that logs it.

| Why |
|---|
| a fault contained and not reported leaves the part unavailable while nobody sees why, so it stays broken. |

## The pipeline

### log-record-passes-one-pipeline · MUST

Every log record, and every record the program's libraries or the server running it log, passes the one telemetry pipeline.

| Why |
|---|
| a record that bypasses the pipeline skips the mask and the trace id, and lands in a second format nobody parses. |

## Records

### log-record-is-an-event-with-fields · SHOULD

Every log record's message is a fixed phrase that names what happened, never formatted with its values. Its values travel as fields beside it.

| Why |
|---|
| a value formatted into the message makes a new string of every record, so one event can no longer be counted or searched as one and its values cannot be filtered — structured logging. |

### logged-failure-carries-its-diagnosis · SHOULD

Every log record of a failure carries the failure's code, its chain of causes and its stack as fields. Exempt: a code or a stack the failure does not carry, such as the code of a defect the runtime raised or the stack of a failure returned as a value.

| Why |
|---|
| an operator counts failures by their code and finds the bug from the cause and the stack, and a failure logged by its message alone gives neither. |

### log-record-carries-the-trace-id · SHOULD

Every log record carries the trace id of its work item.

| Why |
|---|
| a record without its trace id cannot be found with the other records of its work item across the functions and libraries it passed through. |

## Levels

### log-level-has-one-meaning · SHOULD

Every log record is written at the one level whose meaning fits it. An error says that someone acts; a warning, that the work degraded and may need action; info, a step of normal work; debug, detail for a developer.

| Why |
|---|
| an error logged for what needs no action pages someone for nothing, until the alert on errors is ignored and a real one is missed. |

### debug-level-off-in-production · SHOULD

Every log's debug level is off in production.

| Why |
|---|
| debug records in production multiply the volume a collector pays for and carry detail nobody meant an operator, or a leak, to read. |

## Output

### log-output-structured-in-production · SHOULD

Every log is written as one structured object per record in production, a form a setting read at the program's start chooses.

| Why |
|---|
| a collector cannot parse lines meant for a person, so a log written as such lines in production reaches its collector as text it cannot search. |

### log-output-readable-in-development · SHOULD

Every log is written as readable lines in development, a form a setting read at the program's start chooses.

| Why |
|---|
| a person cannot read objects meant for a collector, so a log written as such objects in development hides the record its developer looks for. |
