# Specs

> Governs the specs that render an Ink tree: the frame they read, the keys they press and the screen-reader output they check.

## Frames and keys

### ink-component-spec-reads-the-frame → component-spec-proves-behaviour-and-keyboard · SHOULD

A component's spec renders it with the `render` of **`ink-testing-library`**, presses keys by writing to its `stdin`, and asserts the text of `lastFrame()` with the colour stripped.

| Why | Tags |
|---|---|
| the frame is what the person at the terminal sees, and text without colour is what stays the same on every terminal and under `NO_COLOR`. | [testing] |

## Screen readers

### ink-control-spec-reads-the-screen-reader-output → component-spec-proves-behaviour-and-keyboard · MUST

A control's spec renders it with **`isScreenReaderEnabled`** on and asserts the role, the state and the label of the output Ink reads out.

| Why | Tags |
|---|---|
| no accessibility scanner reads a terminal, so the screen-reader output is the one place a spec sees what a person who cannot see the frame hears. | [a11y, testing] |
