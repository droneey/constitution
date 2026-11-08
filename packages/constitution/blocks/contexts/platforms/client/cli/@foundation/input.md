# Input

> Governs help, the version, flags and prompts.

## Vocabulary

An **interactive stream** is a standard stream the operating system reports connected to a terminal, the device or its emulator at which a person reads a run's output and types its input; a pipe, a file or a log never is one.

## Help

### help-printed-on-the-help-flags · MUST

Every help flag, `-h` or `--help`, prints its help on standard output and exits 0, whatever other arguments stand beside it. That help is the one of the subcommand it is given to, or of the program where it is given to none or to an unknown one. Exempt: one that follows `--` or is the value of a flag.

#### Why

Help is how a person or an agent discovers a program, and help that needs every other argument right first cannot be reached when they are wrong.

#### Examples

```ts title="Avoid"
const { values } = parseArgs({ args, options }); // a bad flag throws before --help is read

if (values.help === true) {
  stdout.write(exportOrdersHelp);
  return ExitCode.Success;
}
```

```ts title="Prefer"
const loose = parseArgs({ args, options, strict: false });

if (loose.values.help === true) {
  stdout.write(exportOrdersHelp);
  return ExitCode.Success;
}

const { values } = parseArgs({ args, options });
```

### version-printed-on-the-version-flag · SHOULD

Every program prints its version on standard output when given `--version`, and exits 0.

#### Why

Without it a bug report cannot name the release that ran, and a script cannot check which one it runs.

#### Examples

```ts title="Avoid"
program
  .name("shop")
  .option("-v, --verbose", "print every request"); // no --version
```

```ts title="Prefer"
program
  .name("shop")
  .version(packageVersion)
  .option("-v, --verbose", "print every request");
```

### help-leads-with-examples · SHOULD

Every help opens with examples of its common use, before the full list of flags. Only what its subcommand, or the program, does comes before the examples.

#### Why

Help that opens with the full list of flags buries the common case most readers came for, and people read examples before reference.

#### Examples

```text title="Avoid"
Export orders as CSV.

Usage: shop orders export [options]

Options:
  --status <status>    only orders in this status
  --since <date>       only orders placed since this date
  -o, --output <file>  write to this file
  --json               print JSON instead of CSV
  -h, --help           print this help

Examples:
  shop orders export --status paid -o paid.csv
```

```text title="Prefer"
Export orders as CSV.

Examples:
  shop orders export --status paid -o paid.csv
  shop orders export --since 2026-01-01 --json

Usage: shop orders export [options]

Options:
  --status <status>    only orders in this status
  --since <date>       only orders placed since this date
  -o, --output <file>  write to this file
  --json               print JSON instead of CSV
  -h, --help           print this help
```

## Flags and prompts

### flag-takes-its-conventional-name · SHOULD

Every flag whose purpose has a conventional name takes it. Such names include `-q`/`--quiet`, `--verbose`, `-n`/`--dry-run`, `-f`/`--force`, `-o`/`--output`, `--json`, `--no-input` and `--no-color`.

#### Why

People and agents guess a flag by its convention, and a flag named otherwise is not found or is mistaken for another.

#### Examples

```ts title="Avoid"
const options = {
  silent: { type: "boolean", short: "s" },
  simulate: { type: "boolean" },
  "out-file": { type: "string" },
} satisfies ParseArgsOptionsConfig;
```

```ts title="Prefer"
const options = {
  quiet: { type: "boolean", short: "q" },
  "dry-run": { type: "boolean", short: "n" },
  output: { type: "string", short: "o" },
} satisfies ParseArgsOptionsConfig;
```

### prompt-only-on-a-terminal · MUST

Every prompt is shown only while standard input is an interactive stream.

#### Why

A prompt in automation or in a pipe waits for an answer nobody can give.

#### Examples

```ts title="Avoid"
const canPrompt = values["no-input"] !== true; // a pipe is no terminal

if (values.store === undefined && !canPrompt) {
  throw new MissingAnswerError("--store");
}

const storeName = values.store ?? (await prompt.ask("Store name: "));
```

```ts title="Prefer"
const canPrompt = stdin.isTTY === true && values["no-input"] !== true;

if (values.store === undefined && !canPrompt) {
  throw new MissingAnswerError("--store");
}

const storeName = values.store ?? (await prompt.ask("Store name: "));
```

### missing-answer-fails-as-a-usage-error · MUST

Where a run may not prompt, every answer it needs and lacks fails the run as a usage error, never guessed. A run may not prompt where `prompt-only-on-a-terminal` or `prompts-turned-off-by-the-no-input-flag` turns its prompts off.

#### Why

A run that cannot ask and goes on without the answer guesses it, and acts on a choice nobody made.

#### Examples

```ts title="Avoid"
const canPrompt = stdin.isTTY === true && values["no-input"] !== true;

const storeName = values.store ?? (canPrompt ? await prompt.ask("Store name: ") : "main"); // guessed
```

```ts title="Prefer"
const canPrompt = stdin.isTTY === true && values["no-input"] !== true;

if (values.store === undefined && !canPrompt) {
  throw new MissingAnswerError("--store");
}

const storeName = values.store ?? (await prompt.ask("Store name: "));
```

### missing-answer-names-the-flag-that-gives-it → failure-shown-as-what-happened-and-what-next · SHOULD

Every usage error for a missing answer names the flag that gives it.

#### Why

An error that names no flag leaves its caller to search the help for the way to give the answer.

#### Examples

```text title="Avoid"
$ shop stores create --no-input
error: a store name is required
$ echo $?
2
```

```text title="Prefer"
$ shop stores create --no-input
error: a store name is required
Give it with --store <name>, as in: shop stores create --store berlin
$ echo $?
2
```

### prompts-turned-off-by-the-no-input-flag · SHOULD

Every prompt is turned off by `--no-input`, even on a terminal.

#### Why

A script run from a terminal otherwise stops at a prompt and waits for an answer nobody gives, where it should fail.

#### Examples

```ts title="Avoid"
const canPrompt = stdin.isTTY === true; // --no-input still prompts on a terminal

if (values.store === undefined && !canPrompt) {
  throw new MissingAnswerError("--store");
}
```

```ts title="Prefer"
const canPrompt = stdin.isTTY === true && values["no-input"] !== true;

if (values.store === undefined && !canPrompt) {
  throw new MissingAnswerError("--store");
}
```
