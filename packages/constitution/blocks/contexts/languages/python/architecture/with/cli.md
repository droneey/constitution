# Command line

> Governs how a Python program's commands are named and registered.

## General

### command-module-named-with-the-cli-suffix → command-is-its-operations-binding-unit · MUST

A command's module is named `<op>_cli.py`, after the operation it runs.

| Why |
|---|
| the suffix tells a command of the command line from a `commands/` folder of the domain, the write side of its use cases. |
