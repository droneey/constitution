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
