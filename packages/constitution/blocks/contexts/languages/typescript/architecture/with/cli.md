# Command line

> Governs the files of a TypeScript command line's commands.

## General

### command-file-named-with-the-cli-suffix → command-is-its-operations-binding-unit · MUST

A command's file is named `<op>.cli.ts`, after the operation it runs.

| Why | Tags |
|---|---|
| the role then reads in the file's name as every other role does in TypeScript, and the command stands apart from the operation's other binding units in its folder. | [] |
