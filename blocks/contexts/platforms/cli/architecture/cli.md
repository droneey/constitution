# Command line

## Commands

## commands-in-the-cli-folder → anatomy-top-level-by-concern
The delivery layer is `cli/`: one `<name>.cli` file per command, shared flag definitions in files beside them, reused and never declared twice, and the list of commands registered beside the files.

| Why | Check | Tags |
|---|---|---|
| every command is found in one place, and a flag means the same thing in every command that takes it. | tool — names | [] |

## report-is-a-value-the-command-prints → no-debug-output-in-shipped-code
What a run reports is a value the command prints at the end, never lines the logic prints along the way.

| Why | Check | Tags |
|---|---|---|
| a value can be printed as text or as data and checked by a test; lines printed from deep inside can be neither. | review | [ux] |

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
