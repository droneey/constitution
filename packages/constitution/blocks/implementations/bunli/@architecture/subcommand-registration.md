# Subcommand registration

> Governs a subcommand's file and how the root registers it.

## General

### bunli-subcommand-from-a-factory → subcommand-built-by-a-factory-the-root-calls · MUST

Every subcommand is built by its factory with `defineCommand`. The factory returns `defineCommand({ name, description, options, handler })`.

| Why |
|---|
| a subcommand that lacks what bunli needs fails only when it is run. |

### bunli-subcommand-registered-with-cli-command → delivery-unit-registered-by-the-root · MUST

The root registers every subcommand with `cli.command` on the program `createCLI` gave it, never through a folder `bunli generate` scans by `commands.directory`.

| Why |
|---|
| a subcommand the root did not register is missing from the one list of what the program answers, and one the generator finds by scanning a folder is registered as a side effect of importing its generated file, so the root no longer shows what the program answers. |
