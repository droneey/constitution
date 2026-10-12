# TypeScript with command line

> Governs the files of a TypeScript command line's commands.

## Layout

### command-file-named-with-the-cli-suffix → cli-folder-holds-one-file-per-command · MUST
A command's file is named `<name>.cli.ts`.

| Why | Tags |
|---|---|
| the role then reads in the file's name as every other role does in TypeScript, and a listing of `cli/` shows every command. | [] |
