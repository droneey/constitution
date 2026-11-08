# Security

> Governs the loading of YAML that is outside input: the tags it honours and the expansion of its aliases.

## Outside input

### tag-naming-a-type-or-a-function-refused → outside-input-never-rebuilt-as-objects · MUST

Every loader of outside input in YAML refuses each tag naming a type or a function of the program's language.

| Why |
|---|
| a loader that honours a tag naming a type or a function of the program's language builds the object or calls the function the sender names, which hands the sender the program. |

### alias-expansion-bounded → memory-for-outside-sized-input-grows-at-most-linearly · MUST

All outside input in YAML is loaded with its alias expansion bounded. Its loader caps the nodes its aliases stand for, counted whether it copies or shares the value each names, or refuses every alias.

| Why |
|---|
| a few lines of nested aliases expand into billions of nodes, so the memory a small file takes grows exponentially with its size and exhausts the reader though the file passed every size check, while a loader that shares what an alias names loads it small, and the work grows exponentially only when code walks or writes the value. |
