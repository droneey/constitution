# Tests

> Governs how a command-line program is tested.

## What a spec proves

### program-tested-through-its-command-line → spec-proves-one-boundary · SHOULD

Every command-line program is tested through its command line. Its spec runs the program on an argument list, with its terminal, prompts and clock replaced, and checks standard output, standard error and the exit code.

| Why |
|---|
| the command line is the program's boundary, so a spec that reaches past it proves less than its user sees, and one with a real terminal or a real clock fails with the machine it runs on. |
