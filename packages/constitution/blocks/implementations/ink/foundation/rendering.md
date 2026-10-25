# Rendering

> Governs how an Ink tree lays out its text, which stream it renders to, when it renders at all, and when Ink is loaded.

## Layout

### ink-layout-through-box-and-text · SHOULD

Every string an Ink tree renders sits in a `<Text>`, and its space, alignment, columns and borders come from the props of `<Box>`; no layout is written as spaces or line breaks inside a string.

| Why |
|---|
| Ink measures each `<Text>` against the terminal's width and wraps it, so a column padded by hand drifts as soon as a cell's content or the width changes. |

## Output

### ink-renders-only-on-a-terminal → styling-only-on-a-terminal · MUST

Ink renders only where the stream it writes to is a terminal, `CI` is unset and the run asks for no plain output; everywhere else — a pipe, a file, CI, a hook — the program prints the same content as plain text, without Ink.

| Why |
|---|
| Ink's frames carry cursor movement and colour, and even its non-interactive mode writes a last frame laid out for a terminal width the reader of a log never has. |

### ink-progress-rendered-to-standard-error → standard-output-holds-only-data · MUST

A tree that shows progress, a prompt or a status is rendered with `render`'s `stdout` option set to standard error; only a tree that is the command's result renders to standard output.

| Why |
|---|
| Ink writes to standard output unless told otherwise, so a spinner left at the default lands in the pipe that carries the result. |

### ink-finished-lines-rendered-once-through-static → progressive-report-printed-as-events-arrive · SHOULD

A progressive report renders its finished lines through `<Static>`, and only the part still in progress is redrawn.

| Why |
|---|
| Ink redraws its whole frame on each update, so a log kept in the frame flickers, grows past the terminal's height and scrolls away half drawn, while `<Static>` writes each finished line once above it. |

## Loading

### ink-loaded-only-on-the-terminal-path · MUST

Ink, and every module that imports it, is reached only through a dynamic `import()` on the path that renders to a terminal; no module the plain path loads imports it.

| Why |
|---|
| Ink and React take tens of milliseconds and megabytes to load, which a hook run on every event, or a command in a pipe, pays on each run for output it never draws. |
