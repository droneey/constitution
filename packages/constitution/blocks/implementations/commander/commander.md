---
id: commander
summary: commander declares each subcommand, its flags and its action.
requires: [client/cli]
languages: []
governs: ["**/presentation/**", "**/root/**", "**/__tests__/**"]
---

# commander

> `commander`, the argument parser of a command line: subcommands, flags, help and the errors of a command line typed wrong.

`configureHelp` shapes its help. commander calls a subcommand a command, and its class is `Command`.
