# Commands

> Governs a command's options, the settings it inherits, how the program is run, and a command's spec.

## General

### commander-options-parsed-by-schema → outside-value-untyped-until-parsed · MUST

A command's action passes its options and arguments through a schema before its work starts; `opts()` is never read as a typed value.

| Why |
|---|
| commander types every option as whatever the command line held, so a cast over `opts()` is a promise the user's typing never made. |

### commander-settings-copied-to-every-command · MUST

A command added with `addCommand` first takes the program's settings through `copyInheritedSettings(program)`, so its output, its exit override and its help are the program's.

| Why |
|---|
| `addCommand` copies none of the settings `command()` copies, so a command added bare writes its errors to the process's streams and exits on its own. |

### commander-run-by-parse-async → async-work-awaited-or-held-by-a-scope · MUST

The program is run with `await program.parseAsync(argv)`, never with `parse`.

| Why |
|---|
| `parse` returns before an asynchronous action ends, so its failure is never awaited and the run exits before its work is done. |

## Specs

### commander-spec-through-its-output-and-exit-hooks → command-tested-through-its-command-line · SHOULD

A command's spec builds the program from the root with `configureOutput` writing to the spec's buffers and `exitOverride()` on, and runs it with `parseAsync(args, { from: 'user' })`.

| Why |
|---|
| the spec then reads what the user would see and the code the run ends with, and the process's own arguments, streams and exit stay untouched. |
