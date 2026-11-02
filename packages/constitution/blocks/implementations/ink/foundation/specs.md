# Specs

> Governs the specs that render an Ink tree: the frame they read, the keys they press and the screen-reader output they check.

## Frames and keys

### ink-component-spec-reads-the-frame → component-spec-proves-behaviour-and-keyboard · SHOULD

An Ink component's spec reads the frame a person sees. It renders the component with the `render` of **`ink-testing-library`**, presses keys by writing to its `stdin`, and asserts the text of `lastFrame()` with the colour stripped.

| Why |
|---|
| a spec that asserts anything but the frame passes while the person at the terminal sees something else, and one that asserts colour fails on another terminal or under `NO_COLOR` though no text a person reads changed. |

## Screen readers

### ink-control-spec-reads-the-screen-reader-output → component-spec-proves-behaviour-and-keyboard · MUST

An Ink control's spec checks what the screen reader reads out. It renders the control with **`isScreenReaderEnabled`** on and asserts the role, the state and the label of the output Ink reads out.

| Why |
|---|
| no accessibility scanner reads a terminal, so a control whose spec skips the screen-reader output reaches a person who cannot see the frame unnamed, and nothing fails. |
