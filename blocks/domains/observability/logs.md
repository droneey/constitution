# Logs

> Governs a log record and its pipeline.

## The pipeline

### log-record-passes-one-pipeline → diagnostics-written-through-a-logger · MUST
Every log record — the program's, its libraries' and its server's — passes one pipeline that enriches, masks and renders it.

| Why | Tags |
|---|---|
| a record that bypasses the pipeline skips the mask and the trace id, and lands in a second format nobody parses. | [security] |

### log-value-masked-by-its-key → secret-and-personal-data-kept-out-of-output · MUST
The log pipeline replaces, before any output, the value of every key the project lists as secret or personal — such as `password`, `token`, `authorization`, `cookie`, `secret`, `email` and `phone` — compared without case and at any depth.

| Why | Tags |
|---|---|
| a secret or a person's data passed as a field by mistake is masked whichever code wrote it, while a mask of exact paths misses the key that arrives in another case or one level deeper. | [security, data] |

## Records

### log-record-is-an-event-with-fields · SHOULD
A log record's message is a fixed phrase that names what happened, and its values travel as fields beside it; nothing is formatted into the message.

| Why | Tags |
|---|---|
| a fixed message is counted and searched as one event and a field is filtered by its value, while a formatted message is a new string every time. | [] |

### log-record-carries-the-service-identity · SHOULD
Every log record carries the identity of the service that wrote it: its name, its version and its environment.

| Why | Tags |
|---|---|
| records of several services and releases meet in one collector, and a record without them cannot be traced to the code that wrote it. | [] |

### log-record-of-a-failure-carries-its-code-and-cause · SHOULD
A log record of a failure carries, as fields, the failure's code, its chain of causes and its stack.

| Why | Tags |
|---|---|
| an operator counts failures by their code and finds the bug from the cause and the stack, and a failure logged by its message alone gives neither. | [errors] |

## Output

### log-output-structured-in-production · SHOULD
The log is written as one structured object per record in production and as readable lines in development, as a setting read at the program's start chooses, never as guessed from the terminal.

| Why | Tags |
|---|---|
| a collector parses one object per record and a person reads lines; a guess from the terminal picks wrongly when a person pipes the output or a container gives the program a terminal. | [] |
