# Lifecycle

> Governs how an Ink app ends: its exit, its unmount and the interrupt it receives as a key.

## General

### ink-app-awaited-before-the-exit-code → async-work-awaited-or-held-by-a-scope · MUST

Every Ink app is awaited through its `waitUntilExit()` before the program sets its exit code.

| Why |
|---|
| an exit code set while an app still runs ends the run before the app has drawn its last frame or taken its last key, and reports an outcome the app has not reached. |

### ink-app-unmounted-on-every-way-out → resource-released-on-every-path · MUST

Every Ink app is unmounted on every way out of the program, a failure's included.

| Why |
|---|
| an app left mounted keeps standard input in raw mode and the cursor hidden, so the terminal stays broken after the program ends. |

## Interrupts

### ink-interrupt-ends-the-run-as-interrupted → program-stops-cleanly · MUST

Every Ink app's Ctrl-C ends the run as an interrupt. An app that reads keys is rendered with `exitOnCtrlC` set to `false`, and its Ctrl-C ends the run through the program's own stopping, with the interrupt's exit code.

| Why |
|---|
| with standard input in raw mode, Ctrl-C reaches Ink as a key and no signal is sent, and Ink's default answer unmounts the app as if its work were done, so the run exits as a success. |
