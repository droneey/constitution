# Command registration

> Governs a command file and how the root adds it to the program.

## General

### commander-command-from-a-factory → command-built-by-a-factory-the-root-calls · MUST

A command is built by its factory as a `Command`. The factory returns a `Command` with its description, options and action, and the root adds it to the program.

| Why |
|---|
| a command the root did not build and add is missing from the one list of what the program answers, and one that lacks what commander needs fails only when it is run. |
