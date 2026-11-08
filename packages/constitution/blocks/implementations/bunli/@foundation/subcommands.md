# Subcommands

> Governs a subcommand's flags, the program's configuration and a subcommand's spec.

## General

### bunli-flags-declared-by-schema → outside-value-untyped-until-parsed · MUST

Every flag is declared by a schema. It is `option(schema, { short, description })`, its schema a standard schema, and the handler receives the parsed flags.

| Why |
|---|
| a flag read raw reaches the handler as whatever the user typed, under a type the input never promised, while a flag declared by its schema is checked once, before the handler runs — parse, don't validate. |

### program-keeps-no-bunli-config → fact-has-one-source · MUST

The program keeps no `bunli.config.*`. Its configuration, its name, version, description and plugins, is given to `createCLI` in code.

| Why |
|---|
| bunli merges a `bunli.config.*` it finds in the working folder into the configuration given in code, so a file beside the program changes what it ships as much as what a spec run from another folder builds. |

### bunli-spec-with-fake-terminal → program-tested-through-its-command-line · SHOULD

Every subcommand's spec runs the program on an argument list, with its terminal and prompt session replaced. It builds the program by `createCLI` with the prompt session and the terminal's information injected through its runtime dependencies, or, for a subcommand that asks nothing, by `createTestCLI` of `@bunli/test`, which captures the output and the exit.

| Why |
|---|
| a spec that calls the handler alone misses the parsing, the output and the exit a user meets, and one run on the real terminal writes to the runner's streams, where no case reads what the user would see. |
