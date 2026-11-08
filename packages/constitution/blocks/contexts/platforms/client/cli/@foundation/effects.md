# Effects

> Governs the standard streams of a run, its interrupt, a run that destroys or changes much, the order of its options' sources and its user's files.

## Streams and signals

### standard-output-holds-only-data → shared-resource-has-one-writer · MUST

Every run's standard output carries only its result. Its diagnostics, progress, prompts and failures go to standard error.

#### Why

A diagnostic on standard output lands in the pipe or the file the next program reads as data and corrupts it, while on standard error it still reaches the person at the terminal.

#### Examples

```ts title="Avoid"
stdout.write("Exporting paid orders...\n"); // lands in orders.csv
stdout.write(csv);
```

```ts title="Prefer"
stderr.write("Exporting paid orders...\n");
stdout.write(csv);
```

### closed-output-ends-the-run-quietly · SHOULD

When the reader of its standard output closes it early, every run stops with no stack trace. It exits with the code the program's map of exit codes gives a closed pipe.

#### Why

A pipeline that reads only the first lines is a normal use, and a trace printed for it reads as a failure of the program.

#### Examples

```ts title="Avoid"
// src/main.ts
process.exitCode = await runCli(process.argv.slice(2), io); // `| head -1` ends in an EPIPE trace
```

```ts title="Prefer"
// src/main.ts
process.stdout.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code !== "EPIPE") {
    throw error;
  }
  process.exit(ExitCode.ClosedPipe);
});

process.exitCode = await runCli(process.argv.slice(2), io);
```

### interrupted-run-says-it-is-stopping · SHOULD

On an interrupt, every run says on standard error that it is stopping before it cleans up.

#### Why

A person presses Ctrl-C to get the terminal back, and a run that goes silent while it cleans up looks hung, so the person presses again and ends the cleanup half done.

#### Examples

```ts title="Avoid"
// src/main.ts
const interrupt = new AbortController();

process.once("SIGINT", () => {
  interrupt.abort(); // silent while it cleans up
});
```

```ts title="Prefer"
// src/main.ts
const interrupt = new AbortController();

process.once("SIGINT", () => {
  process.stderr.write("Stopping: cleaning up before exit...\n");
  interrupt.abort();
});
```

## Operations

### destructive-run-confirmed-or-forced · MUST

Every run that would destroy what its arguments do not name, or what it cannot restore, goes ahead only once confirmed. Its user confirms it at a prompt. Exempt: a run given `--force`, its confirmation in advance.

#### Why

A typo, or an agent running the program unattended, otherwise destroys what nobody meant to — fail-safe defaults.

#### Examples

```ts title="Avoid"
const orders = await listCancelledOrders(input, context);

await purgeOrders({ orderIds: orders.map(Order.id) }, context); // gone without a question
return ExitCode.Success;
```

```ts title="Prefer"
const orders = await listCancelledOrders(input, context);
stderr.write(describePurge(orders));

if (values.force !== true) {
  if (!canPrompt) {
    throw new MissingAnswerError("--force");
  }
  if (!(await prompt.confirm("Delete them?"))) {
    return ExitCode.Failure;
  }
}

await purgeOrders({ orderIds: orders.map(Order.id) }, context);
return ExitCode.Success;
```

### destructive-run-shows-what-it-would-destroy · MUST

Every run that `destructive-run-confirmed-or-forced` holds back for a confirmation prints what it would destroy, before it asks or refuses.

#### Why

A person asked to confirm what they cannot see confirms it blind, and one refused without seeing it cannot tell whether `--force` would destroy what they meant.

#### Examples

```text title="Avoid"
$ shop orders purge --status cancelled
Delete the matching orders? [y/N]
```

```text title="Prefer"
$ shop orders purge --status cancelled
This deletes 3 cancelled orders and cannot be undone:
  A-1031  cancelled 2026-02-11  EUR 42.00
  A-1038  cancelled 2026-02-14  EUR 18.50
  A-1040  cancelled 2026-02-20  EUR 96.10
Delete them? [y/N]
```

### run-that-changes-much-offers-a-dry-run · SHOULD

Every run that changes many things at once, or anything it cannot restore, offers `--dry-run`. Such runs include one over every file a pattern matches and a migration that rewrites every record. Given it, the run shows what it would do and changes nothing.

#### Why

A pattern or a flag such as `--all` reaches far more than its user pictured, and a deploy or a migration that destroys nothing it cannot restore, and nothing its arguments do not name, is never held back for a confirmation, so its user learns its reach from the damage, while a script or an agent that must see what an irreversible run would do has no way to ask but to start the run and refuse its confirmation.

#### Examples

```ts title="Avoid"
const plan = await planRepricing(input, context);

await applyRepricing(plan, context); // its reach is learnt from the damage
return ExitCode.Success;
```

```ts title="Prefer"
const plan = await planRepricing(input, context);

if (values["dry-run"] === true) {
  stdout.write(renderRepricingPlan(plan));
  return ExitCode.Success;
}

await applyRepricing(plan, context);
return ExitCode.Success;
```

## Configuration

### option-taken-from-flag-then-variable-then-files · MUST

Every option a run can take from several sources ranks its flag first and the system's configuration file last. Between them come its environment variable, then the project's configuration file, then the user's.

#### Why

Which of a flag, a variable and three files is the narrowest choice is not plain, so without one order a program ranks a file above the variable set for one session, or the user's file above the project's, and a choice made for that session or that project is lost without a word, while a script written against one program's order misreads the next's.

#### Examples

```ts title="Avoid"
const region =
  values.region ??
  projectConfig.region ?? // a file outranks the variable set for this session
  env.SHOP_REGION ??
  userConfig.region ??
  systemConfig.region;
```

```ts title="Prefer"
const region =
  values.region ??
  env.SHOP_REGION ??
  projectConfig.region ??
  userConfig.region ??
  systemConfig.region;
```

### user-file-kept-in-the-systems-base-directories · SHOULD

Every file a program keeps for its user lives in the base directory of its kind. Configuration, cache, data and state each have their own: the one `XDG_CONFIG_HOME`, `XDG_CACHE_HOME`, `XDG_DATA_HOME` or `XDG_STATE_HOME` names where it is set to an absolute path, on any system; else, on a Unix-like system, the XDG Base Directory specification's default, whatever folders the system also names; else the known folder the system names. None lives in a dotfile at the root of the home directory.

#### Why

People back up, clear and sync these directories by kind, so a cache kept beside configuration is backed up for nothing, configuration kept in a cache is lost when it is cleared and a history kept as data is synced to every machine, while a relative path in an `XDG_*` variable, which the specification calls invalid, puts the files wherever the run happens to start — the XDG Base Directory specification.

#### Examples

```ts title="Avoid"
export const configFile = join(homedir(), ".shoprc");
export const cacheDirectory = join(homedir(), ".shop", "cache");
```

```ts title="Prefer"
const baseDirectory = (variable: string, fallback: string): string => {
  const set = env[variable];
  return set !== undefined && isAbsolute(set) ? set : join(homedir(), fallback);
};

export const configFile = join(baseDirectory("XDG_CONFIG_HOME", ".config"), "shop", "config.toml");
export const cacheDirectory = join(baseDirectory("XDG_CACHE_HOME", ".cache"), "shop");
```
