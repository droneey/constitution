# Command registration

> Governs a command file and how the root registers it.

## General

### bunli-command-from-a-factory → command-built-by-a-factory-the-root-calls · MUST

A command is built by its factory with `defineCommand`. The factory returns `defineCommand({ name, description, options, handler })`, and `createCLI` registers the commands the root built.

| Why |
|---|
| a command the root did not build and register is missing from the one list of what the program answers, and one that lacks what bunli needs fails only when it is run. |
