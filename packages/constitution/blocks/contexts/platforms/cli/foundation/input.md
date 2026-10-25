# Input

> Governs help, the version, flags and prompts.

## Help

### help-printed-on-h-and-help · MUST

`-h` and `--help` print the command's help to standard output and exit 0, whatever other options precede them, unless they follow `--` or are the value of a flag.

| Why |
|---|
| help is how a person or an agent discovers a command, and help that needs every other argument right first cannot be reached when they are wrong. |

### help-leads-with-examples · SHOULD

A command's help opens with what the command does and examples of its common use, before the full list of flags.

| Why |
|---|
| people read examples before reference, and most come to the help for the common case. |

### version-printed-on-version · SHOULD

`--version` prints the program's version to standard output and exits 0.

| Why |
|---|
| a bug report and a script both need to know which release ran. |

## Flags and prompts

### flag-takes-its-conventional-name · SHOULD

A flag whose purpose has a conventional name takes it: `-q`/`--quiet`, `--verbose`, `-n`/`--dry-run`, `-f`/`--force`, `-o`/`--output`, `--json`, `--no-input`, `--no-color`.

| Why |
|---|
| people and agents guess a flag by its convention, and a flag named otherwise is not found or is mistaken for another. |

### prompt-only-on-a-terminal · MUST

A command prompts only when its standard input is a terminal; without one, a missing answer is a usage error that names the flag that gives it.

| Why |
|---|
| a prompt in CI or in a pipe waits for an answer nobody can give. |

### prompts-turned-off-by-the-no-input-flag · SHOULD

`--no-input` turns off every prompt, even on a terminal.

| Why |
|---|
| a person at a terminal also runs commands from scripts, and needs a way to make a run fail rather than wait for them. |

## Requirements for implementation

### command-framework-parses-flags-by-schema · SHOULD

Flags are declared with a schema and parsed before the handler runs.

| Why |
|---|
| a handler then receives typed, validated input, and a bad flag is a usage error before any work starts. |
