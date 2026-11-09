# Rendering

> Governs how an Ink tree lays out its text, which stream it renders to, when it renders at all, and when Ink is loaded.

## Layout

### ink-layout-never-spelled-in-strings · SHOULD

Every Ink tree lays out its text through `<Box>` and `<Text>`, never through spaces in a string. Its space, alignment, columns and borders come from the props of `<Box>`.

#### Why

Ink measures each `<Text>` against the terminal's width and wraps it, so a column padded by hand drifts as soon as a cell's content or the width changes.

#### Examples

```tsx title="Avoid"
<Text>
  {`${order.number.padEnd(12)}  ${formatMoney(order.total).padStart(10)}`}
</Text>
```

```tsx title="Prefer"
<Box gap={2}>
  <Box width={12}>
    <Text>{order.number}</Text>
  </Box>
  <Box width={10} justifyContent="flex-end">
    <Text>{formatMoney(order.total)}</Text>
  </Box>
</Box>
```

## Output

### ink-renders-only-on-a-terminal → styling-only-on-a-terminal · MUST

Ink renders only where `styling-only-on-a-terminal` leaves animation and cursor movement on, `CI` is unset and the run asks for no plain output.

#### Why

Ink's frames carry cursor movement and colour, which fill a pipe or a log with escape codes, and even its non-interactive mode writes a last frame laid out for a terminal width the reader of a log never has.

#### Examples

```ts title="Avoid"
const isInteractive = process.stderr.isTTY;
```

```ts title="Prefer"
const isInteractive =
  canStyle(process.stderr, process.env) && process.env.CI === undefined && !options.isPlain;
```

### ink-content-printed-plain-off-a-terminal · MUST

Wherever Ink does not render, the program prints the same content as plain text, without Ink. Such places are a pipe, a file, CI and a commit hook.

#### Why

A program that shows its content only through Ink leaves a pipe or a log without what a person at a terminal sees, so whoever reads it misses the result.

#### Examples

```ts title="Avoid"
export const reportSync = async (report: SyncReport, isInteractive: boolean): Promise<void> => {
  if (isInteractive) {
    await renderSyncReport(report);
  }
};
```

```ts title="Prefer"
export const reportSync = async (report: SyncReport, isInteractive: boolean): Promise<void> => {
  if (isInteractive) {
    await renderSyncReport(report);

    return;
  }

  process.stderr.write(formatSyncReport(report));
};
```

### ink-progress-rendered-to-standard-error → standard-output-holds-only-data · MUST

Every Ink tree that shows progress, a prompt or a status renders to standard error. It is rendered with `render`'s `stdout` option set to standard error, and only a tree that is the command's result renders to standard output.

#### Why

Ink writes to standard output unless told otherwise, so a spinner left at the default lands in the pipe that carries the result and corrupts what the next program reads.

#### Examples

```tsx title="Avoid"
const app = render(<ExportProgress events={events} />);
```

```tsx title="Prefer"
const app = render(<ExportProgress events={events} />, { stdout: process.stderr });
```

### ink-finished-lines-rendered-once-through-static → progress-printed-as-it-goes · SHOULD

Every progressive report renders each line it is done with through `<Static>`, and only the part still in progress is redrawn.

#### Why

Ink redraws its whole frame on each update, so a log kept in the frame flickers, grows past the terminal's height and scrolls away half drawn, while `<Static>` writes each such line once above it.

#### Examples

```tsx title="Avoid"
export const SyncProgress = ({ synced, current }: SyncProgressProps): ReactElement => (
  <Box flexDirection="column">
    {synced.map((order) => (
      <Text key={order.id}>{order.number}</Text>
    ))}
    <Spinner label={current.number} />
  </Box>
);
```

```tsx title="Prefer"
export const SyncProgress = ({ synced, current }: SyncProgressProps): ReactElement => (
  <>
    <Static items={synced}>{(order) => <Text key={order.id}>{order.number}</Text>}</Static>
    <Spinner label={current.number} />
  </>
);
```

## Loading

### ink-loaded-only-on-the-terminal-path · SHOULD

Ink is loaded only on the path that renders to a terminal. Ink, and every module that imports it, is reached only through a dynamic `import()` on that path, and no module the plain path loads imports it.

#### Why

Ink and React take tens of milliseconds and megabytes to load, which a program a tool runs as its hook on every event, or a command in a pipe, pays on each run for output it never draws.

#### Examples

```ts title="Avoid"
import { renderSyncReport } from './sync-report.ink';

export const reportSync = async (report: SyncReport, isInteractive: boolean): Promise<void> => {
  if (isInteractive) {
    await renderSyncReport(report);

    return;
  }

  process.stderr.write(formatSyncReport(report));
};
```

```ts title="Prefer"
export const reportSync = async (report: SyncReport, isInteractive: boolean): Promise<void> => {
  if (isInteractive) {
    const { renderSyncReport } = await import('./sync-report.ink');

    await renderSyncReport(report);

    return;
  }

  process.stderr.write(formatSyncReport(report));
};
```
