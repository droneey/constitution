---
id: cli
kind: context
summary: A program run from a command line, one command per invocation.
chapters: []
requires: []
extends: null
abstract: false
checks: []
owns: []
governs: ["**/cli/**"]
status: stable
---

# Command line

> A program a person or a script runs from a terminal. Its delivery layer is `cli/`; each command is a file `<name>.cli` there. The word "command" alone stays core's write side of a use-case.

## Commands

## commands-in-the-cli-folder · SHOULD
The delivery layer is `cli/`: one `<name>.cli` file per command, shared flag definitions in files beside them, reused and never declared twice, and the list of commands registered beside the files.
**Why:** every command is found in one place, and a flag means the same thing in every command that takes it.
**Check:** tool — names
**Tags:** architecture, naming
**Implements:** `anatomy-top-level-by-concern`

## command-parses-calls-prints · SHOULD
A command parses its flags, resolves its input, calls one use-case or composition, and prints the result.
**Why:** the logic then runs the same from a test, another command or another transport.
**Check:** review
**Tags:** architecture
**Implements:** `delivery-units-stay-thin`

## report-is-a-value-the-command-prints · SHOULD
What a run reports is a value the command prints at the end, never lines the logic prints along the way.
**Why:** a value can be printed as text or as data and checked by a test; lines printed from deep inside can be neither.
**Check:** review
**Tags:** architecture, ux
**Implements:** `no-debug-output-in-shipped-code`

## Output and exit

## stdout-data-stderr-diagnostics · SHOULD
Data goes to standard output; diagnostics and failures go to standard error.
**Why:** a script that pipes the output receives only the data, and the person at the terminal still sees what went wrong.
**Check:** test
**Tags:** ux

## json-flag-for-machine-output · SHOULD
A command that reports data prints it as JSON when given `--json`.
**Why:** another program can then read the result without parsing text meant for people.
**Check:** test
**Tags:** ux

## exit-codes-from-one-map · MUST
Exit codes come from one map: 0 success, 1 a failure the user can act on, 2 a usage error — an unknown command, a bad flag — and 70 an internal error, the program's own bug. Only the boundary handler exits.
**Why:** a script decides what to do from the exit code alone, so each code must mean one thing in every command.
**Check:** test
**Tags:** errors, ux
**Implements:** `one-error-handler-per-transport`

## output-masks-secret-values · MUST
Every value the run knows to be secret is masked in all output, an engine's output included, before it is printed.
**Why:** terminal output lands in CI logs and shared screens, where a secret is leaked to everyone who reads them.
**Check:** test
**Tags:** security
**Implements:** `no-secret-or-personal-data-in-output`

## Input

## flags-over-environment-over-file · SHOULD
A setting given in several places takes the flag first, then the environment, then the file.
**Why:** the most specific, most recent choice wins, so a user overrides a file for one run without editing it.
**Check:** test
**Tags:** ux

## no-prompt-without-a-terminal · MUST
Without a terminal the program never prompts; a missing answer is a usage error that names its flag.
**Why:** a prompt in CI waits forever for an answer nobody can give.
**Check:** test
**Tags:** ux

## Testing

## command-tested-through-its-command-line · SHOULD
A command's spec runs the program on an argument list with a fake command context, and checks standard output, standard error and the exit code.
**Why:** that is the command's boundary, so the spec proves what a user of the command sees.
**Check:** test
**Tags:** testing
**Implements:** `spec-per-boundary`

## Requirements for implementation

What any command framework must provide.

## command-framework-parses-flags-by-schema · SHOULD
Flags are declared with a schema and parsed before the handler runs.
**Why:** a handler then receives typed, validated input, and a bad flag is a usage error before any work starts.
**Check:** review
**Tags:** types, ux

## command-framework-leaves-exits-to-the-handler · MUST
The program's handler decides every exit code, the framework's own failures included.
**Why:** without it, the one map of exit codes cannot hold.
**Check:** review
**Tags:** errors

## command-framework-runs-in-a-test-sandbox · MUST
The framework's terminal, prompts, clock and process hooks can be replaced in a spec.
**Why:** without it, a command's spec reaches the real process and breaks the test sandbox.
**Check:** review
**Tags:** testing
