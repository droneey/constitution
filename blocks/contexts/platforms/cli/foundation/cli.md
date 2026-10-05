# Command line

## Output and exit

## exit-codes-from-one-map · MUST
Exit codes come from one map: 0 success, 1 a failure the user can act on, 2 a usage error — an unknown command, a bad flag — and 70 an internal error, the program's own bug.

| Why | Check | Tags |
|---|---|---|
| a script decides what to do from the exit code alone, so each code must mean one thing in every command. | test | [errors, ux] |

## stdout-data-stderr-diagnostics · SHOULD
Data goes to standard output; diagnostics and failures go to standard error.

| Why | Check | Tags |
|---|---|---|
| a script that pipes the output receives only the data, and the person at the terminal still sees what went wrong. | test | [ux] |

## json-flag-for-machine-output · SHOULD
A command that reports data prints it as JSON when given `--json`.

| Why | Check | Tags |
|---|---|---|
| another program can then read the result without parsing text meant for people. | test | [ux] |

## progressive-report-printed-as-events-arrive · SHOULD
The command prints a progressive report as its events arrive, and any other report once, at the end of the run.

| Why | Check | Tags |
|---|---|---|
| a person watching a long run sees it move, and any other result is read whole, by a person or by the next program in a pipe. | review | [ux] |

## output-masks-secret-values → no-secret-or-personal-data-in-output
Every value the run knows to be secret is masked in all output, an engine's output included, before it is printed.

| Why | Check | Tags |
|---|---|---|
| terminal output lands in CI logs and shared screens, where a secret is leaked to everyone who reads them. | test | [] |

## Input

## flags-over-environment-over-file · SHOULD
A setting given in several places takes the flag first, then the environment, then the file.

| Why | Check | Tags |
|---|---|---|
| the most specific, most recent choice wins, so a user overrides a file for one run without editing it. | test | [ux] |

## no-prompt-without-a-terminal · MUST
Without a terminal the program never prompts; a missing answer is a usage error that names its flag.

| Why | Check | Tags |
|---|---|---|
| a prompt in CI waits forever for an answer nobody can give. | test | [ux] |

## Testing

## command-tested-through-its-command-line → spec-per-boundary
A command's spec runs the program on an argument list with a fake command context, and checks standard output, standard error and the exit code.

| Why | Check | Tags |
|---|---|---|
| that is the command's boundary, so the spec proves what a user of the command sees. | test | [] |

## Requirements for implementation

What any command framework must provide.

## command-framework-parses-flags-by-schema · SHOULD
Flags are declared with a schema and parsed before the handler runs.

| Why | Check | Tags |
|---|---|---|
| a handler then receives typed, validated input, and a bad flag is a usage error before any work starts. | review | [ux] |

## command-framework-leaves-exits-to-the-handler · MUST
The program's handler decides every exit code, the framework's own failures included.

| Why | Check | Tags |
|---|---|---|
| without it, the one map of exit codes cannot hold. | review | [errors] |

## command-framework-runs-in-a-test-sandbox · MUST
The framework's terminal, prompts, clock and process hooks can be replaced in a spec.

| Why | Check | Tags |
|---|---|---|
| without it, a command's spec reaches the real process and breaks the test sandbox. | review | [testing] |
