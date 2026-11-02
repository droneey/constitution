# Input

> Governs help, the version, flags and prompts.

## Help

### help-printed-on-h-and-help · MUST

`-h` and `--help` print the command's help and exit 0. They print it to standard output, whatever other options precede them, unless they follow `--` or are the value of a flag.

| Why |
|---|
| help is how a person or an agent discovers a command, and help that needs every other argument right first cannot be reached when they are wrong. |

### version-printed-on-version · SHOULD

`--version` prints the program's version to standard output and exits 0.

| Why |
|---|
| without it a bug report cannot name the release that ran, and a script cannot check which one it runs. |

### help-leads-with-examples · SHOULD

A command's help leads with examples. It opens with what the command does and examples of its common use, before the full list of flags.

| Why |
|---|
| help that opens with the full list of flags buries the common case most readers came for, and people read examples before reference. |

## Flags and prompts

### flag-takes-its-conventional-name · SHOULD

A flag whose purpose has a conventional name takes it. The names are `-q`/`--quiet`, `--verbose`, `-n`/`--dry-run`, `-f`/`--force`, `-o`/`--output`, `--json`, `--no-input` and `--no-color`.

| Why |
|---|
| people and agents guess a flag by its convention, and a flag named otherwise is not found or is mistaken for another. |

### prompt-only-on-a-terminal · MUST

A command prompts only on a terminal. It prompts only when its standard input is a terminal; without one, a missing answer is a usage error that names the flag that gives it.

| Why |
|---|
| a prompt in CI or in a pipe waits for an answer nobody can give. |

### prompts-turned-off-by-the-no-input-flag · SHOULD

`--no-input` turns off every prompt, even on a terminal.

| Why |
|---|
| a script run from a terminal otherwise stops at a prompt and waits for an answer nobody gives, where it should fail. |

## Requirements for implementation

### command-framework-parses-flags-by-schema · SHOULD

Flags are declared with a schema and parsed before the handler runs.

| Why |
|---|
| flags read by hand inside the handler reach it untyped, and a bad flag is found after work has started — parse, don't validate. |
