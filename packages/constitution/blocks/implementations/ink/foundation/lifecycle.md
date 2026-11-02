# Lifecycle

> Governs how an Ink app ends: its unmount and the interrupt it receives as a key.

## General

### ink-app-awaited-and-unmounted → resource-released-on-every-path · MUST

Every Ink app is awaited and unmounted before the program sets its exit code. The program awaits each app's `waitUntilExit()` and unmounts it on every way out, a failure's included.

| Why |
|---|
| an app left mounted keeps standard input in raw mode and the cursor hidden, so the terminal stays broken after the program ends. |

## Interrupts

### ink-interrupt-ends-the-run-as-interrupted → interrupt-ends-the-run-promptly · MUST

An Ink app's Ctrl-C ends the run as an interrupt. An app that reads keys is rendered with **`exitOnCtrlC`** set to `false`, and its Ctrl-C ends the run through the program's own stopping, with the interrupt's exit code.

| Why |
|---|
| with standard input in raw mode, Ctrl-C reaches Ink as a key and no signal is sent, and Ink's default answer unmounts the app as if it had finished, so the run exits as a success. |
