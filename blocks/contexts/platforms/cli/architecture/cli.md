# Command line

> Its delivery layer is `cli/`; each command of the command line is a file `<name>.cli` there. A command of the command line is not the write side of a use-case, which core keeps in `commands/`.

## Commands

## commands-in-the-cli-folder → anatomy-top-level-by-concern
The delivery layer is `cli/`: one `<name>.cli` file per command, shared flag definitions in files beside them, reused and never declared twice, and the list of commands registered beside the files.

| Why | Check | Tags |
|---|---|---|
| every command is found in one place, and a flag means the same thing in every command that takes it. | review | [] |

## command-files-in-cli → commands-in-the-cli-folder
`cli/` holds `<name>.cli` files and plain files beside them, and no file of another role.

| Why | Check | Tags |
|---|---|---|
| every command is found in one place. | tool/names | [] |

## report-is-a-value-the-command-prints → report-returned-as-a-value
The command prints a progressive report as its events arrive, and any other report once, at the end of the run.

| Why | Check | Tags |
|---|---|---|
| a person watching a long run sees it move, and any other result is read whole, by a person or by the next program in a pipe. | review | [ux] |

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
