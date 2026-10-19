# Relations

> Governs a function's variables.

## Construction and state

### function-variable-declared-local → state-never-global-and-mutable · MUST

In Bash, a function declares every variable it sets as `local`.

| Why | Tags |
|---|---|
| a variable a function sets without `local` changes the caller's variable of the same name, an effect no call shows. | [] |
