# Command line

> Its delivery layer is `cli/`; each command of the command line is a file `<name>.cli` there. A command of the command line is not the write side of a use-case, which core keeps in `commands/`.

## Commands

### commands-in-the-cli-folder → package-laid-out-by-the-tree
The delivery layer is `cli/`: one `<name>.cli` file per command, shared flag definitions in files beside them, reused and never declared twice, and the list of commands registered beside the files. `cli/` holds no file of another role.

| Why | Tags |
|---|---|
| every command is found in one place, and a flag means the same thing in every command that takes it. | [] |
