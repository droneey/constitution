# Lifecycle

> Governs how an Ink app ends: its exit, its unmount and the interrupt it receives as a key.

## General

### ink-app-awaited-before-the-exit-code → async-work-awaited-or-held-by-a-scope · MUST

Every Ink app is awaited through its `waitUntilExit()` before the program sets its exit code.

#### Why

An exit code set while an app still runs ends the run before the app has drawn its last frame or taken its last key, and reports an outcome the app has not reached.

#### Examples

```tsx title="Avoid"
export const runSync = (command: SyncCommand): void => {
  render(<SyncProgress command={command} />, { stdout: process.stderr });
  process.exitCode = ExitCode.Success;
};
```

```tsx title="Prefer"
export const runSync = async (command: SyncCommand): Promise<void> => {
  const app = render(<SyncProgress command={command} />, { stdout: process.stderr });

  await app.waitUntilExit();
  process.exitCode = ExitCode.Success;
};
```

### ink-app-unmounted-on-every-way-out → resource-released-on-every-path · MUST

Every Ink app is unmounted on every way out of the program, a failure's included.

#### Why

An app left mounted keeps standard input in raw mode and the cursor hidden, so the terminal stays broken after the program ends.

#### Examples

```tsx title="Avoid"
const app = render(<SyncProgress events={events} />, { stdout: process.stderr });

await syncOrders(command, events);
app.unmount();
```

```tsx title="Prefer"
const app = render(<SyncProgress events={events} />, { stdout: process.stderr });

try {
  await syncOrders(command, events);
} finally {
  app.unmount();
}
```

## Interrupts

### ink-interrupt-ends-the-run-as-interrupted → program-stops-cleanly · MUST

Every Ink app's Ctrl-C ends the run as an interrupt. An app that reads keys is rendered with `exitOnCtrlC` set to `false`, and its Ctrl-C ends the run through the program's own stopping, with the interrupt's exit code.

#### Why

With standard input in raw mode, Ctrl-C reaches Ink as a key and no signal is sent, and Ink's default answer unmounts the app as if its work were done, so the run exits as a success.

#### Examples

```tsx title="Avoid"
render(<OrderPicker orders={orders} onPick={onPick} />, { stdout: process.stderr });
```

```tsx title="Prefer"
// order-picker.hooks.ts
export const useInterrupt = (onInterrupt: () => void): void => {
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      onInterrupt();
    }
  });
};

// pick-order.tsx
render(<OrderPicker orders={orders} onPick={onPick} onInterrupt={stop.interrupt} />, {
  stdout: process.stderr,
  exitOnCtrlC: false,
});
```
