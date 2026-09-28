# Command line

## Output and exit

## exit-codes-from-one-map · MUST
Exit codes come from one map: 0 success, 1 a failure the user can act on, 2 a usage error — an unknown command, a bad flag — and 70 an internal error, the program's own bug.
**Why:** a script decides what to do from the exit code alone, so each code must mean one thing in every command.
**Check:** test
**Tags:** errors, ux

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
