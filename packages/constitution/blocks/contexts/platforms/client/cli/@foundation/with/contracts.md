# Contracts

> Governs how the output a script reads of a command-line program changes: its `--json` output and its exit codes.

## Changes

### script-facing-output-changed-in-steps → format-changed-in-steps · MUST

Every `--json` output loses a field only after a release that marked it deprecated. It renames or retypes one only after a release that offered the new form beside the old.

#### Why

Scripts read the fields of that output, and a field that disappears or changes its type sends them wrong at the next upgrade without a word — the expand–contract pattern.

#### Examples

```ts title="Avoid"
export type OrderJson = {
  readonly number: string;
  readonly state: OrderStatus; // replaced status in one release
};
```

```ts title="Prefer"
export type OrderJson = {
  readonly number: string;
  readonly state: OrderStatus;
  /** @deprecated Since 2.4: read state; removed in 3.0. */
  readonly status: OrderStatus;
};
```

### exit-code-never-reused → format-changed-in-steps · MUST

Every exit code keeps the meaning it was released with, never reused for another outcome.

#### Why

Scripts branch on the exit codes, and a code that changes its meaning sends them down the wrong branch at the next upgrade without a word.

#### Examples

```ts title="Avoid"
export enum ExitCode {
  Success = 0,
  Failure = 1,
  Usage = 2,
  ChangesFound = 3, // meant "store locked" in 1.x
  Defect = 70,
  Interrupted = 130,
}
```

```ts title="Prefer"
export enum ExitCode {
  Success = 0,
  Failure = 1,
  Usage = 2,
  /** @deprecated Since 2.0: no run ends with it, and no outcome takes it again. */
  StoreLocked = 3,
  ChangesFound = 4,
  Defect = 70,
  Interrupted = 130,
}
```
