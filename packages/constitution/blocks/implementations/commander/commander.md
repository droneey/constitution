---
id: commander
summary: commander declares each command, its flags and its action.
requires: [cli, typescript]
extends: null
abstract: false
languages: []
governs: ["**/*.cli.ts"]
---

# commander

> **`commander`**, the argument parser of a JavaScript command line: commands, flags, help and the errors of a command line typed wrong.

The program runs by **`parseAsync`**, with **`exitOverride`** on, so a command line typed wrong throws a **`CommanderError`**; **`configureOutput`** gives it the writers, **`configureHelp`** shapes its help, and **`copyInheritedSettings`** passes the program's settings to a command added to it.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `command-framework-parses-flags-by-schema` | commander parses each flag by its declaration, its `choices` and its `argParser`, and hands the action `opts()` untyped, which the action parses by schema (`commander-options-parsed-by-schema`) | partly |
| `command-framework-leaves-exits-to-the-handler` | `exitOverride()` turns each exit commander would make into a thrown `CommanderError`, which the program maps (`commander-exits-overridden-and-mapped`) | partly |
| `command-framework-runs-in-a-test-sandbox` | output goes through `configureOutput`, exits through `exitOverride()`, and the arguments through `parseAsync(args, { from: 'user' })`; commander keeps no clock and asks no question (`commander-spec-through-its-output-and-exit-hooks`) | partly |
