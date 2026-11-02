# Commands

> Governs a command's options, the settings it inherits, and a command's spec.

## General

### commander-options-parsed-by-schema → outside-value-untyped-until-parsed · MUST

A command's options and arguments are parsed by a schema before its work starts. `opts()` is never read as a typed value.

| Why |
|---|
| commander types every option as whatever the command line held, so a cast over `opts()` is a promise the user's typing never made — parse, don't validate. |

### commander-settings-copied-to-every-command · MUST

Every command added with `addCommand` takes the program's settings first. It calls `copyInheritedSettings(program)`, so its output, its exit override and its help are the program's.

| Why |
|---|
| `addCommand` copies none of the settings `command()` copies, so a command added bare writes its errors to the process's streams and exits on its own. |

## Specs

### commander-spec-through-its-output-and-exit-hooks → command-tested-through-its-command-line · SHOULD

A command's spec runs the program with its output and its exit captured. It builds the program from the root with `configureOutput` writing to the spec's buffers and `exitOverride()` on, and runs it with `parseAsync(args, { from: 'user' })`.

| Why |
|---|
| a spec without these hooks writes to the process's streams and ends the runner's process on the command's exit, so it reads neither what the user would see nor the code the run ends with. |
