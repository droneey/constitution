---
id: bunli
kind: implementation
summary: bunli declares each command, its flags and its handler.
chapters: []
requires: [bun, cli]
extends: null
abstract: false
checks: []
owns: [bunli]
governs: ["**/cli/**"]
status: stable
---

# bunli

> The command framework of a Bun program.

## bunli-command-from-a-factory · SHOULD
Each command file exports `create<Name>Command(context)`, which returns `defineCommand({ name, description, options, handler })`; the root builds the context, and `createCLI` registers the commands.
**Why:** a command receives what it needs from the root, and a spec builds it with fakes.
**Check:** review
**Tags:** architecture
**Implements:** `command-parses-calls-prints`

## bunli-flags-declared-by-schema · SHOULD
Every flag is `option(schema, { short, description })`, its schema a standard schema, and the handler receives the parsed flags.
**Why:** a flag is validated once, before the handler runs, and the handler works with typed values.
**Check:** review
**Tags:** types
**Implements:** `untrusted-input-parsed-at-edge`

## bunli-handler-through-the-error-handler · SHOULD
Every handler runs its work through the program's one error handler, which maps a failure to the exit map.
**Why:** every command then exits by the same map, whatever fails.
**Check:** review
**Tags:** errors
**Implements:** `exit-codes-from-one-map`

## bunli-spec-with-fake-terminal · SHOULD
A command's spec builds the program with a fake terminal and prompt session — `createCLI(meta, terminal)` — and runs it on an argument list.
**Why:** the spec drives the command as a user does, and reads what the user would see.
**Check:** test
**Tags:** testing
**Implements:** `command-tested-through-its-command-line`

## Requirements

| Requirement | How in bunli | Status |
|---|---|---|
| `command-framework-parses-flags-by-schema` | `option(schema)`, parsed before the handler | met |
| `command-framework-leaves-exits-to-the-handler` | the program's failures pass its handler; bunli's own exits — an unknown command, a bad global flag, help, version — call `process.exit` with its own codes | partial: the program's failures all pass the handler; bunli's own exits keep its codes |
| `command-framework-runs-in-a-test-sandbox` | the terminal and prompt session are injected; signal listeners, `Date.now()` and the lookup of `bunli.config.*` stay real | partial: those effects change nothing a spec checks |
