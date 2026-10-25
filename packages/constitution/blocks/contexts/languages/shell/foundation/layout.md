# Layout

> Governs a script's interpreter line and its extension.

## Kinds

### executable-script-names-its-shell · MUST

An executable script names the shell it is written for on its first line: `#!/usr/bin/env bash`, or `#!/bin/sh` for one written to POSIX alone.

| Why | Tags |
|---|---|
| a script run by another shell than its own fails on the first construct that shell lacks, often silently, and `env` finds the Bash the project pins rather than an older one of the system. | [] |

## Names

### shell-file-ends-in-sh → format-has-one-extension · SHOULD

A shell file ends in **`.sh`**; a command installed on a user's path under its own name is built or linked from such a file.

| Why | Tags |
|---|---|
| one extension lets every glob, linter and reader find every script, while a command's name is what its users type. | [] |
