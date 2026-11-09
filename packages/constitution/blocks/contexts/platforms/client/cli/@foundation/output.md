# Output

> Governs a run's machine-readable output, its progress and its result, its styling and its slow steps.

## General

### data-printed-as-json-on-the-json-flag · SHOULD

Every run that reports data prints it as machine-readable data when given `--json`.

#### Why

Without it another program parses text written for people, which breaks at the first rewording.

#### Examples

```ts title="Avoid"
for (const order of orders) {
  stdout.write(`${order.number}  ${order.status}  ${Money.format(order.total)}\n`);
} // a script parses these columns
```

```ts title="Prefer"
if (values.json === true) {
  stdout.write(`${JSON.stringify(orders.map(toOrderJson))}\n`);
  return ExitCode.Success;
}

for (const order of orders) {
  stdout.write(`${order.number}  ${order.status}  ${Money.format(order.total)}\n`);
}
```

### progress-printed-as-it-goes · SHOULD

Every run prints its progress as it goes, never only at its end.

#### Why

A long run that reports only at its end looks hung to the person watching it, who interrupts a run that was working.

#### Examples

```ts title="Avoid"
for (const file of files) {
  await importOrders({ file }, context);
}

stderr.write(`Imported ${String(files.length)} files\n`); // silent until the end
```

```ts title="Prefer"
for (const [index, file] of files.entries()) {
  await importOrders({ file }, context);
  stderr.write(`Imported ${file} (${String(index + 1)}/${String(files.length)})\n`);
}
```

### run-result-printed-whole · SHOULD

Every result a run prints is printed whole, never in pieces: one value once, at the run's end, and each item of a sequence whole, as it arrives.

#### Why

A result printed in pieces is read half done by a person or by the next program in a pipe.

#### Examples

```ts title="Avoid"
stdout.write(`${order.number}\t`);
const total = await pricing.total(order, context);
stdout.write(`${Money.format(total)}\n`); // half a line waits on the call
```

```ts title="Prefer"
const total = await pricing.total(order, context);
stdout.write(`${order.number}\t${Money.format(total)}\n`);
```

### slow-step-announced-before-it-starts · SHOULD

Before a step that may take long, every run prints on standard error what it is doing. Such steps include a network call and a large read.

#### Why

Silence reads as a hang, and a person who sees nothing interrupts a run that was working.

#### Examples

```ts title="Avoid"
const orders = await ordersApi.listAll(context); // seconds of silence
```

```ts title="Prefer"
stderr.write("Fetching every order from shop.example...\n");
const orders = await ordersApi.listAll(context);
```

## Styling

### styling-only-on-a-terminal · MUST

Every stream is styled by default only while it is an interactive stream. Even there styling, such as colour, animation and cursor movement, stays off where `TERM` is `dumb`, where `NO_COLOR` is set and not empty, where `FORCE_COLOR` is `0` or `false`, or where `--no-color` was given. Exempt: colour asked for explicitly, as `explicit-colour-request-overrides-the-default` gives it.

#### Why

Escape codes in a pipe, a file or a log are noise to whoever reads it, and `NO_COLOR` is the one variable a person sets for every program — the NO_COLOR convention.

#### Examples

```ts title="Avoid"
const isSet = (value: string | undefined): value is string => value !== undefined && value !== "";

export const colorEnabled = (stream: Stream, flags: ColorFlags, env: Environment): boolean => {
  if (flags.noColor) {
    return false;
  }
  if (flags.color) {
    return true;
  }
  if (isSet(env.NO_COLOR)) {
    return false;
  }
  if (isSet(env.FORCE_COLOR)) {
    return env.FORCE_COLOR !== "0" && env.FORCE_COLOR !== "false";
  }
  return true; // escape codes in every pipe and log
};
```

```ts title="Prefer"
const isSet = (value: string | undefined): value is string => value !== undefined && value !== "";

export const colorEnabled = (stream: Stream, flags: ColorFlags, env: Environment): boolean => {
  if (flags.noColor) {
    return false;
  }
  if (flags.color) {
    return true;
  }
  if (isSet(env.NO_COLOR)) {
    return false;
  }
  if (isSet(env.FORCE_COLOR)) {
    return env.FORCE_COLOR !== "0" && env.FORCE_COLOR !== "false";
  }
  return stream.isTTY === true && env.TERM !== "dumb";
};
```

### explicit-colour-request-overrides-the-default · MUST

Where no request that outranks it turns colour off, every explicit request for colour turns colour on, whatever the stream. The requests for colour and against it rank `--no-color` first, then `--color`, then a non-empty `NO_COLOR`, then a non-empty `FORCE_COLOR`, which asks against colour where it is `0` or `false` and for it otherwise.

#### Why

A log that renders colour gets none unless it can ask for it, a variable set for every program that outranked a flag given for one run could not be overridden for that run, and a `FORCE_COLOR` of `0` or `false` is set to turn colour off, as the most widely used readers of the variable take it, so a program that read it as a request for colour would do the opposite of what its user asked — the NO_COLOR and FORCE_COLOR conventions.

#### Examples

```ts title="Avoid"
const isSet = (value: string | undefined): value is string => value !== undefined && value !== "";

export const colorEnabled = (stream: Stream, flags: ColorFlags, env: Environment): boolean => {
  if (flags.noColor) {
    return false;
  }
  if (stream.isTTY !== true || env.TERM === "dumb") {
    return false; // --color and FORCE_COLOR never reach a log
  }
  if (flags.color) {
    return true;
  }
  if (isSet(env.NO_COLOR)) {
    return false;
  }
  if (isSet(env.FORCE_COLOR)) {
    return env.FORCE_COLOR !== "0" && env.FORCE_COLOR !== "false";
  }
  return true;
};
```

```ts title="Prefer"
const isSet = (value: string | undefined): value is string => value !== undefined && value !== "";

export const colorEnabled = (stream: Stream, flags: ColorFlags, env: Environment): boolean => {
  if (flags.noColor) {
    return false;
  }
  if (flags.color) {
    return true;
  }
  if (isSet(env.NO_COLOR)) {
    return false;
  }
  if (isSet(env.FORCE_COLOR)) {
    return env.FORCE_COLOR !== "0" && env.FORCE_COLOR !== "false";
  }
  return stream.isTTY === true && env.TERM !== "dumb";
};
```
