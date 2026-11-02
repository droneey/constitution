# Tests

> Governs how a command is tested, and the framework's test sandbox.

## What a spec proves

### command-tested-through-its-command-line → spec-proves-one-boundary · SHOULD

A command is tested through its command line. Its spec runs the program on an argument list, with its terminal, prompts and clock replaced, and checks standard output, standard error and the exit code.

| Why |
|---|
| the command line is the command's boundary, so a spec that reaches past it proves less than its user sees, and one with a real terminal or a real clock fails with the machine it runs on. |

## Requirements for implementation

### command-framework-runs-in-a-test-sandbox · MUST

The framework's terminal, prompts, clock and process hooks can be replaced in a spec.

| Why |
|---|
| a framework whose terminal, prompts, clock or process hooks cannot be replaced makes a command's spec write to the real terminal, wait on a real prompt or end the runner's process. |
