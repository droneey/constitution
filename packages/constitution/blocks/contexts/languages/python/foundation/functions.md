# Functions

> Governs the parameters a function takes by keyword only.

## Parameters

### parameter-past-the-third-keyword-only → function-takes-at-most-three-positions · SHOULD

A parameter past the third positional one is keyword-only, declared after a bare `*`.

| Why | Tags |
|---|---|
| a keyword-only parameter is named at every call, so no caller has to remember its position. | [] |

### boolean-parameter-keyword-only → function-takes-no-boolean-position · SHOULD

A boolean parameter is keyword-only, declared after a bare `*`.

| Why | Tags |
|---|---|
| the call then reads `save(user, notify=True)`, never `save(user, True)`. | [] |
