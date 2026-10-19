# Output

> Governs JSON output, progress, styling, status and slow steps.

## General

### data-printed-as-json-on-the-json-flag · SHOULD

A command that reports data prints it as JSON when given `--json`.

| Why | Tags |
|---|---|
| another program then reads the result without parsing text written for people. | [ux] |

### progressive-report-printed-as-events-arrive · SHOULD

The command prints a progressive report as its events arrive, and any other report once, at the end of the run.

| Why | Tags |
|---|---|
| a person watching a long run sees it move, and any other result is read whole, by a person or by the next program in a pipe. | [ux] |

### styling-only-on-a-terminal · MUST

A stream is styled — colour, animation, cursor movement — only when it is a terminal, `TERM` is not `dumb`, `NO_COLOR` is unset or empty and `--no-color` was not given; a flag that asks for colour overrides `NO_COLOR`.

| Why | Tags |
|---|---|
| escape codes in a pipe, a file or a log are noise to whoever reads it, and `NO_COLOR` is a person's one setting for every program. | [ux, a11y] |

### status-never-shown-by-colour-alone · SHOULD

A status shown in colour also carries a word or a symbol.

| Why | Tags |
|---|---|
| without colour — in a log, under `NO_COLOR`, for a reader who cannot tell the colours apart — colour alone says nothing. | [a11y, ux] |

### slow-step-announced-before-it-starts · SHOULD

Before a step that may take long — a network call, a large read — a command prints on standard error what it is doing.

| Why | Tags |
|---|---|
| silence reads as a hang, and a person who sees nothing interrupts a command that was working. | [ux] |
