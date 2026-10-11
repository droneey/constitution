# Python with command line

> Governs how a Python program's commands are named and registered.

## Layout

### command-module-named-with-the-cli-suffix → cli-folder-holds-one-file-per-command · MUST
A command of the command line is one module `<name>_cli.py`.

| Why | Tags |
|---|---|
| the suffix tells a command from the flags and the registry beside it, and from core's `commands/`, the write side of a use case. | [] |
