# Command line

> Governs the command line's place in the tree: its commands, their registration and their shared flags.

## Layers

### shared-flag-declared-once-in-shared → shared-piece-placed-by-meaning · SHOULD
A flag two or more commands take is declared once, in `shared/`, and every command that takes it imports that declaration.

| Why | Tags |
|---|---|
| a flag then means the same in every command that takes it, and the set folder of commands holds commands alone. | [] |

## Layout

### cli-folder-holds-one-file-per-command → set-folder-holds-only-members · SHOULD
The delivery layer of a command line is `cli/`, the set folder of its commands: one file for each command, carrying the `cli` role in the language's spelling, and the surface that offers them, and nothing else. Its name is singular to keep it apart from the domain's `commands/`.

| Why | Tags |
|---|---|
| every command is found in one place, and adding a command is adding a file. | [] |

## Root

### command-registered-by-the-root → composition-root-wires-everything · MUST
The composition root registers every command into the command framework from the names the surface of `cli/` offers; no command is found by scanning a folder or registers itself on import.

| Why | Tags |
|---|---|
| the root is then the one place that shows every command the program has, and a command added or removed changes that list, not a framework's guess. | [] |
