# Commands

> Governs a command's flags, its configuration and its spec.

## General

### bunli-flags-declared-by-schema → outside-value-untyped-until-parsed · MUST

Every flag is `option(schema, { short, description })`, its schema a standard schema, and the handler receives the parsed flags.

| Why | Tags |
|---|---|
| a flag is validated once, before the handler runs, and the handler works with typed values. | [] |

### program-keeps-no-bunli-config → fact-has-one-source · MUST

The program keeps no `bunli.config.*`: its configuration lives only in the code that builds it.

| Why | Tags |
|---|---|
| bunli merges a `bunli.config.*` it finds in the working folder into the configuration given in code, so a file beside the program changes what it ships as much as what a spec run from another folder builds. | [] |

### bunli-spec-with-fake-terminal → command-tested-through-its-command-line · SHOULD

A command's spec builds the program with a fake terminal and prompt session — `createCLI(meta, terminal)` — and runs it on an argument list.

| Why | Tags |
|---|---|
| the spec drives the command as a user does, and reads what the user would see. | [] |
