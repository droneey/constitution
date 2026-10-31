# Output

> Governs JSON output, progress, styling, status and slow steps.

## General

### data-printed-as-json-on-the-json-flag · SHOULD

A command that reports data prints it as JSON when given `--json`.

| Why |
|---|
| another program then reads the result without parsing text written for people. |

### progressive-report-printed-as-events-arrive · SHOULD

A report of a run's progress is printed as its events arrive; the result is printed once, whole, when the run ends.

| Why |
|---|
| a person watching a long run sees it move, and any other result is read whole, by a person or by the next program in a pipe. |

### styling-only-on-a-terminal · MUST

A stream is styled — colour, animation, cursor movement — only when it is a terminal, `TERM` is not `dumb`, `NO_COLOR` is unset or empty and `--no-color` was not given, save colour that an explicit request turns on.

| Why |
|---|
| escape codes in a pipe, a file or a log are noise to whoever reads it, and `NO_COLOR` is a person's one setting for every program. |

### colour-forced-by-an-explicit-request · SHOULD

An explicit request for colour turns colour on whatever the stream: `--color`, which overrides `NO_COLOR`, or `FORCE_COLOR` set to any non-empty value, `0` included, which a non-empty `NO_COLOR` overrides; `--no-color` overrides both.

| Why |
|---|
| a request for colour serves a log that renders it, a flag given for one run outranks a setting for every program, and of the two settings the one that keeps colour off wins. |

### status-never-shown-by-colour-alone · SHOULD

A status shown in colour also carries a word or a symbol.

| Why |
|---|
| without colour — in a log, under `NO_COLOR`, for a reader who cannot tell the colours apart — colour alone says nothing. |

### slow-step-announced-before-it-starts · SHOULD

Before a step that may take long — a network call, a large read — a command prints on standard error what it is doing.

| Why |
|---|
| silence reads as a hang, and a person who sees nothing interrupts a command that was working. |
