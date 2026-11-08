# Command registration

> Governs a subcommand's file and how the root adds it to the program.

## General

### commander-subcommand-built-as-a-command → subcommand-built-by-a-factory-the-root-calls · MUST

Every subcommand's factory returns a `Command` with its description, options and action.

| Why |
|---|
| a subcommand whose options or action are added outside its factory is built in two places, so its file no longer shows what it takes and what it does. |

### commander-subcommand-registered-with-add-command → delivery-unit-registered-by-the-root · MUST

The root registers every subcommand it built with `addCommand` on the program, never as a stand-alone executable commander searches a folder for.

| Why |
|---|
| a subcommand the root did not register is missing from the one list of what the program answers, and a stand-alone executable is found by its file's name beside the entry script, by a search no file lists (commander's readme). |
