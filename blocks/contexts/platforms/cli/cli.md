---
id: cli
summary: A program run from a command line, one command per invocation.
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**/cli/**"]
---

# Command line

> A program a person or a script runs from a terminal.

## Output and exit

### exit-codes-from-one-map · MUST
Exit codes come from one map: 0 success, 1 a failure the user can act on, 2 a usage error — an unknown command, a bad flag — and 70 an internal error, the program's own bug.

| Why | Tags |
|---|---|
| a script decides what to do from the exit code alone, so each code must mean one thing in every command; 2 is the usage code of the shell's utilities and argument parsers, and 70 is `EX_SOFTWARE` of sysexits, the code for an internal error. | [errors, ux] |

### stdout-data-stderr-diagnostics · SHOULD
Data goes to standard output; diagnostics and failures go to standard error.

| Why | Tags |
|---|---|
| a script that pipes the output receives only the data, and the person at the terminal still sees what went wrong. | [ux] |

### json-flag-for-machine-output · SHOULD
A command that reports data prints it as JSON when given `--json`.

| Why | Tags |
|---|---|
| another program can then read the result without parsing text meant for people. | [ux] |

### progressive-report-printed-as-events-arrive · SHOULD
The command prints a progressive report as its events arrive, and any other report once, at the end of the run.

| Why | Tags |
|---|---|
| a person watching a long run sees it move, and any other result is read whole, by a person or by the next program in a pipe. | [ux] |

### output-masks-secret-values → secret-and-personal-data-kept-out-of-output
Every value the run knows to be secret is masked in all output, an engine's output included, before it is printed.

| Why | Tags |
|---|---|
| terminal output lands in CI logs and shared screens, where a secret is leaked to everyone who reads them. | [] |

## Input

### flags-over-environment-over-file · SHOULD
A setting given in several places takes the flag first, then the environment, then the file.

| Why | Tags |
|---|---|
| the most specific, most recent choice wins, so a user overrides a file for one run without editing it. | [ux] |

### no-prompt-without-a-terminal · MUST
Without a terminal the program never prompts; a missing answer is a usage error that names its flag.

| Why | Tags |
|---|---|
| a prompt in CI waits forever for an answer nobody can give. | [ux] |

## Testing

### command-tested-through-its-command-line → spec-proves-one-boundary
A command's spec runs the program on an argument list with a fake command context, and checks standard output, standard error and the exit code.

| Why | Tags |
|---|---|
| that is the command's boundary, so the spec proves what a user of the command sees. | [] |

## Requirements for implementation

What any command framework must provide.

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
