# Output

> Governs JSON output, progress, styling, status and slow steps.

## General

### data-printed-as-json-on-the-json-flag · SHOULD

A command that reports data prints it as JSON when given `--json`. That JSON is a format another program reads, and its schema is the one core asks of such a format.

| Why |
|---|
| without it another program parses text written for people, which breaks at the first rewording. |

### progressive-report-printed-as-events-arrive · SHOULD

A run prints its progress as it goes and its result once, at its end. A report of the run's progress is printed as its events arrive; the result is printed whole, when the run ends.

| Why |
|---|
| a long run that reports only at its end looks hung to the person watching it, and a result printed in pieces is read half done by a person or by the next program in a pipe. |

### styling-only-on-a-terminal · MUST

A stream is styled only on a terminal, unless colour is asked for explicitly. By default, styling — colour, animation, cursor movement — applies only when the stream is a terminal, `TERM` is not `dumb`, `NO_COLOR` is unset or empty and `--no-color` was not given. An explicit request turns colour on whatever the stream: `--color`, which overrides `NO_COLOR`, or `FORCE_COLOR` set to any non-empty value, `0` included, which a non-empty `NO_COLOR` overrides; `--no-color` overrides both.

| Why |
|---|
| escape codes in a pipe, a file or a log are noise to whoever reads it, and `NO_COLOR` is a person's one setting for every program; a log that renders colour gets none unless it can ask for it, and a setting for every program that outranked a flag given for one run could not be overridden for that run — the NO_COLOR convention. |

### status-never-shown-by-colour-alone · SHOULD

A status a command prints carries its word or its symbol in the text. Its colour only adorns that word or symbol, so the line says the same with the colour stripped — under `NO_COLOR`, in a pipe or in a log.

| Why |
|---|
| in a log, under `NO_COLOR` or for a reader who cannot tell the colours apart, a status shown by colour alone says nothing. |

### slow-step-announced-before-it-starts · SHOULD

A slow step is announced before it starts. Before a step that may take long — a network call, a large read — a command prints on standard error what it is doing.

| Why |
|---|
| silence reads as a hang, and a person who sees nothing interrupts a command that was working. |
