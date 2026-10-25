# Tests

> Governs how a command is tested, and the framework's test sandbox.

## What a spec proves

### command-tested-through-its-command-line → spec-proves-one-boundary · SHOULD

A command's spec runs the program on an argument list, with its terminal, prompts and clock replaced, and checks standard output, standard error and the exit code.

| Why |
|---|
| the command line is the command's boundary, so the spec proves what its user sees, without a real terminal or a real clock. |

## Requirements for implementation

### command-framework-runs-in-a-test-sandbox · MUST

The framework's terminal, prompts, clock and process hooks can be replaced in a spec.

| Why |
|---|
| without it, a command's spec reaches the real process and breaks the test sandbox. |
