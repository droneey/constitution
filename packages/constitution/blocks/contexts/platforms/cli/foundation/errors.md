# Errors

> Governs a failure of a command-line program: an unknown command, and who decides its exit code.

## General

### unknown-command-never-guessed · SHOULD

An unknown command or flag is never guessed. It is a usage error that names the closest match and never runs it; no command answers to an abbreviation of its name.

| Why |
|---|
| a guess run in place of what was typed may be the destructive command, and an abbreviation that works today runs another command once a new one shares its start. |

## Requirements for implementation

### command-framework-leaves-exits-to-the-handler · MUST

The program's handler decides every exit code, the framework's own failures included.

| Why |
|---|
| a framework that exits on its own failures uses codes outside the one map, and a script reads them wrong. |
