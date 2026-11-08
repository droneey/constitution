# Relations

> Governs how a script's functions hold state: a function's variables.

## Construction and state

### function-variable-declared-local → state-never-global-and-mutable · MUST

In Bash, every function declares every variable it sets as `local`.

| Why |
|---|
| a variable a function sets without `local` changes the caller's variable of the same name, an effect no call shows. |
