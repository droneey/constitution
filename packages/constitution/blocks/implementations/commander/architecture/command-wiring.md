# Command wiring

> Governs a command file and how the root adds it to the program.

## General

### commander-command-from-a-factory → command-built-by-a-factory-the-root-calls · MUST

A command's factory returns a `Command` with its description, options and action, and the root adds it to the program.

| Why |
|---|
| the command then carries everything commander needs of it, and the program lists what the root added, nothing else. |
