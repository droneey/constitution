# Input

> Governs help, the version, flags and prompts.

## Vocabulary

An **interactive stream** is a standard stream the operating system reports connected to a terminal, the device or its emulator at which a person reads a run's output and types its input; a pipe, a file or a log never is one.

## Help

### help-printed-on-the-help-flags · MUST

Every help flag, `-h` or `--help`, prints its help on standard output and exits 0, whatever other arguments stand beside it. That help is the one of the subcommand it is given to, or of the program where it is given to none or to an unknown one. Exempt: one that follows `--` or is the value of a flag.

| Why |
|---|
| help is how a person or an agent discovers a program, and help that needs every other argument right first cannot be reached when they are wrong. |

### version-printed-on-the-version-flag · SHOULD

Every program prints its version on standard output when given `--version`, and exits 0.

| Why |
|---|
| without it a bug report cannot name the release that ran, and a script cannot check which one it runs. |

### help-leads-with-examples · SHOULD

Every help opens with examples of its common use, before the full list of flags. Only what its subcommand, or the program, does comes before the examples.

| Why |
|---|
| help that opens with the full list of flags buries the common case most readers came for, and people read examples before reference. |

## Flags and prompts

### flag-takes-its-conventional-name · SHOULD

Every flag whose purpose has a conventional name takes it. Such names include `-q`/`--quiet`, `--verbose`, `-n`/`--dry-run`, `-f`/`--force`, `-o`/`--output`, `--json`, `--no-input` and `--no-color`.

| Why |
|---|
| people and agents guess a flag by its convention, and a flag named otherwise is not found or is mistaken for another. |

### prompt-only-on-a-terminal · MUST

Every prompt is shown only while standard input is an interactive stream.

| Why |
|---|
| a prompt in automation or in a pipe waits for an answer nobody can give. |

### missing-answer-fails-as-a-usage-error · MUST

Where a run may not prompt, every answer it needs and lacks fails the run as a usage error, never guessed. A run may not prompt where `prompt-only-on-a-terminal` or `prompts-turned-off-by-the-no-input-flag` turns its prompts off.

| Why |
|---|
| a run that cannot ask and goes on without the answer guesses it, and acts on a choice nobody made. |

### missing-answer-names-the-flag-that-gives-it → failure-shown-as-what-happened-and-what-next · SHOULD

Every usage error for a missing answer names the flag that gives it.

| Why |
|---|
| an error that names no flag leaves its caller to search the help for the way to give the answer. |

### prompts-turned-off-by-the-no-input-flag · SHOULD

Every prompt is turned off by `--no-input`, even on a terminal.

| Why |
|---|
| a script run from a terminal otherwise stops at a prompt and waits for an answer nobody gives, where it should fail. |
