# Functions

> Governs a function in Python: the parameters it takes by keyword only.

## Parameters

### parameter-past-the-third-keyword-only → function-takes-at-most-three-positions · MUST

Every parameter past the third positional one, a method's `self` or `cls` not counted, is keyword-only, declared after a bare `*`. Exempt: a signature a framework imposes.

| Why |
|---|
| a fourth positional parameter is passed by its place, which a caller gets wrong unseen, while a keyword-only one is named at every call. |

### boolean-parameter-keyword-only → function-takes-no-boolean-position · MUST

Every boolean parameter is keyword-only, declared after a bare `*`.

| Why |
|---|
| a boolean passed by position is a bare `True` or `False` at the call site, which says nothing of what it switches, while a keyword-only one is named at the call. |
