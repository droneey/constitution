# Command wiring

> Governs a command file and where commander is imported.

## General

### commander-command-from-a-factory → command-built-by-a-factory-the-root-calls · MUST

A command's factory returns a `Command` with its description, options and action, and the root adds it to the program.

| Why | Tags |
|---|---|
| the command then carries everything commander needs of it, and the program lists what the root added, nothing else. | [] |

### commander-imported-by-commands → command-parser-imported-by-the-command-files · MUST

commander is the command-line parser, imported in the command files, `<op>.cli.ts`.

| Why | Tags |
|---|---|
| the setting that holds the parser's home names its package. | [] |
