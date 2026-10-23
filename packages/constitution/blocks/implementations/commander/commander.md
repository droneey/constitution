---
id: commander
summary: commander declares each command, its flags and its action.
requires: [cli, typescript]
extends: null
abstract: false
languages: []
dictionary: [commander, CommanderError, exitOverride, parseAsync, configureOutput, configureHelp, copyInheritedSettings]
governs: ["**/*.cli.ts"]
---

# commander

> The argument parser of a JavaScript command line: commands, flags, help and the errors of a command line typed wrong.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `command-framework-parses-flags-by-schema` | commander parses each flag by its declaration, its `choices` and its `argParser`, and hands the action `opts()` untyped, which the action parses by schema (`commander-options-parsed-by-schema`) | partly |
| `command-framework-leaves-exits-to-the-handler` | `exitOverride()` turns each exit commander would make into a thrown `CommanderError`, which the program maps (`commander-exits-overridden-and-mapped`) | partly |
| `command-framework-runs-in-a-test-sandbox` | output goes through `configureOutput`, exits through `exitOverride()`, and the arguments through `parseAsync(args, { from: 'user' })`; commander keeps no clock and asks no question (`commander-spec-through-its-output-and-exit-hooks`) | partly |
