---
id: cli
summary: Commands, flags, streams, exit codes and help of a command line.
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**"]
---

# Command line

> A program a person or a script runs from a terminal, one command per run: it reads flags, the environment and configuration files, writes its result and its diagnostics to two streams, and answers with an exit code.

## Errors

### exit-codes-from-one-map → failure-told-apart-by-code · MUST

Exit codes come from one map: 0 success, 1 a failure the user can act on, 2 a usage error — an unknown command, a bad flag, a missing answer — 70 the program's own defect, and 128 plus the number of the signal that ended a run — 130 an interrupt, 141 a closed pipe, 143 a termination request (`SIGTERM`); any other outcome a caller branches on takes a code of its own in the map.

| Why | Tags |
|---|---|
| a script decides what to do from the exit code alone, so each code must mean one thing in every command; 2 is the usage code of the shell's utilities, 70 is the code sysexits gives an internal error, and 130 is how shells report an interrupt, 128 plus the signal's number. | [errors, ux] |

### unknown-command-never-guessed · SHOULD

An unknown command or flag is a usage error that names the closest match and never runs it; no command answers to an abbreviation of its name.

| Why | Tags |
|---|---|
| a guess run in place of what was typed may be the destructive command, and an abbreviation that works today runs another command once a new one shares its start. | [ux, errors] |

## Effects

### standard-output-holds-only-data → diagnostics-written-through-a-logger · MUST

Standard output carries only the command's result; diagnostics, progress, prompts and failures go to standard error.

| Why | Tags |
|---|---|
| a pipe or a file then receives only the data the next program reads, while the person at the terminal still sees what happened. | [ux] |

### interrupt-ends-the-run-promptly → program-stops-cleanly · MUST

On an interrupt a command says it is stopping, cleans up within a bound and exits as interrupted; a second interrupt ends it without the cleanup.

| Why | Tags |
|---|---|
| a person presses Ctrl-C to get the terminal back, and a command that ignores it, or hangs in its cleanup, holds the terminal and whatever it locked. | [ux, errors] |

### closed-output-ends-the-run-quietly · SHOULD

When the reader of standard output closes it, as `head` does, the command stops without a stack trace and exits as a program ended by `SIGPIPE`.

| Why | Tags |
|---|---|
| a pipeline that reads only the first lines is a normal use, and a trace printed for it reads as a failure of the command. | [ux] |

### setting-taken-from-flag-then-environment-then-files · SHOULD

A setting given in several places is taken from the flag first, then the environment, then the project's configuration file, then the user's, then the system's.

| Why | Tags |
|---|---|
| the most specific and most recent choice wins, so a user overrides a file for one run, and a project overrides a user's defaults, without editing either. | [ux] |

### user-file-kept-in-the-systems-base-directories · SHOULD

Configuration, cache and data a program keeps for its user live in the system's base directory for each kind — the XDG directories on Linux, and on macOS too, and the platform's own on Windows, an `XDG_*` variable that is set honoured on every system — never in a dotfile at the root of the home directory.

| Why | Tags |
|---|---|
| people back up, clear and sync these directories by kind, so a cache kept beside configuration is backed up for nothing, and configuration kept in a cache is lost when it is cleared. | [ux, data] |

### destructive-command-confirmed-or-forced → irreversible-operation-runs-dry-by-default · MUST

A command that destroys more than its arguments name, or what it cannot restore, asks for confirmation on a terminal; without one it refuses with a usage error unless `--force` is given, and it offers `--dry-run`.

| Why | Tags |
|---|---|
| a typo, or an agent running the command unattended, otherwise destroys what nobody meant to, and no prompt can be answered where no terminal is. | [security, ux] |

## Security

### output-masks-every-known-secret → secret-and-personal-data-kept-out-of-output · MUST

Every value the run knows to be secret is masked in all output, that of the tools it runs included, before it is printed.

| Why | Tags |
|---|---|
| terminal output lands in CI logs and on shared screens, where a printed secret is leaked to everyone who reads them. | [security] |

### secret-never-passed-as-a-flag → secret-never-passed-as-a-process-argument · MUST

A secret reaches a command through a file only its user can read, standard input, the system's credential store, or an environment built for it where its caller offers no other way, never as the value of a flag.

| Why | Tags |
|---|---|
| a flag's value is visible to every user of the machine in the process list and is kept in the shell's history. | [security] |

## Changes

### json-output-changed-only-by-adding-fields → format-changed-in-steps · MUST

A command's JSON output changes by gaining fields; a field is removed, renamed or retyped only after a release that offered its replacement beside it.

| Why | Tags |
|---|---|
| scripts read the JSON as a contract, and a field that disappears breaks every one of them silently at the next upgrade. | [data] |

### exit-code-keeps-its-meaning → format-changed-in-steps · MUST

An exit code keeps the meaning it was released with; a new outcome gets a code of its own, and no code is reused for another.

| Why | Tags |
|---|---|
| a script that calls the command branches on its codes, and a code that changes its meaning sends it down the wrong branch without a word. | [errors] |

## Tests

### command-tested-through-its-command-line → spec-proves-one-boundary · SHOULD

A command's spec runs the program on an argument list, with its terminal, prompts and clock replaced, and checks standard output, standard error and the exit code.

| Why | Tags |
|---|---|
| the command line is the command's boundary, so the spec proves what its user sees, without a real terminal or a real clock. | [testing] |

## Input

### help-printed-on-h-and-help · MUST

`-h` and `--help` print the command's help to standard output and exit 0, whatever other options precede them, unless they follow `--` or are the value of a flag.

| Why | Tags |
|---|---|
| help is how a person or an agent discovers a command, and help that needs every other argument right first cannot be reached when they are wrong. | [ux] |

### help-leads-with-examples · SHOULD

A command's help opens with what the command does and examples of its common use, before the full list of flags.

| Why | Tags |
|---|---|
| people read examples before reference, and most come to the help for the common case. | [ux] |

### version-printed-on-version · SHOULD

`--version` prints the program's version to standard output and exits 0.

| Why | Tags |
|---|---|
| a bug report and a script both need to know which release ran. | [ux] |

### flag-takes-its-conventional-name · SHOULD

A flag whose purpose has a conventional name takes it: `-q`/`--quiet`, `--verbose`, `-n`/`--dry-run`, `-f`/`--force`, `-o`/`--output`, `--json`, `--no-input`, `--no-color`.

| Why | Tags |
|---|---|
| people and agents guess a flag by its convention, and a flag named otherwise is not found or is mistaken for another. | [ux] |

### prompt-only-on-a-terminal · MUST

A command prompts only when its standard input is a terminal; without one, a missing answer is a usage error that names the flag that gives it.

| Why | Tags |
|---|---|
| a prompt in CI or in a pipe waits for an answer nobody can give. | [ux] |

### prompts-turned-off-by-the-no-input-flag · SHOULD

`--no-input` turns off every prompt, even on a terminal.

| Why | Tags |
|---|---|
| a person at a terminal also runs commands from scripts, and needs a way to make a run fail rather than wait for them. | [ux] |

## Output

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

## Requirements for implementation

### command-framework-parses-flags-by-schema · SHOULD

Flags are declared with a schema and parsed before the handler runs.

| Why | Tags |
|---|---|
| a handler then receives typed, validated input, and a bad flag is a usage error before any work starts. | [ux] |

### command-framework-leaves-exits-to-the-handler · MUST

The program's handler decides every exit code, the framework's own failures included.

| Why | Tags |
|---|---|
| without it, the one map of exit codes cannot hold. | [errors] |

### command-framework-runs-in-a-test-sandbox · MUST

The framework's terminal, prompts, clock and process hooks can be replaced in a spec.

| Why | Tags |
|---|---|
| without it, a command's spec reaches the real process and breaks the test sandbox. | [testing] |
