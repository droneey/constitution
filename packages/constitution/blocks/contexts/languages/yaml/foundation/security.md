# Security

> Governs the loading of outside YAML and the expansion of its aliases.

## Input from outside

### outside-yaml-loaded-by-a-safe-loader → outside-input-never-rebuilt-as-objects · MUST

YAML from outside the program is loaded by a loader that builds only mappings, sequences and plain scalars, and refuses a tag that names a type of the language.

| Why |
|---|
| a loader that honours such a tag builds the object the sender names and runs its constructor, which hands the sender the program. |

### alias-expansion-bounded → outside-input-bounded-before-it-is-parsed · MUST

YAML from outside the program is loaded with a bound on how many aliases to collections it expands, or with aliases refused.

| Why |
|---|
| a few lines of nested aliases expand into billions of nodes, so a small file exhausts the reader's memory and time. |
