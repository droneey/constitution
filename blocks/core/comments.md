# Comments

> Governs a comment, documentation, a mark of deprecation.

## Comments

### comment-explains-why · SHOULD
A comment states a constraint, a workaround or a decision the code cannot show; a comment that narrates the next line is removed.

| Why | Tags |
|---|---|
| the code already says what it does, and a narrating comment repeats it and drifts from it. | [] |

### public-entry-documented-only-where-not-obvious · SHOULD
The documentation of a public entry states only what its names and types cannot — a precondition, a unit, a failure, an effect, a bound — and never restates them.

| Why | Tags |
|---|---|
| documentation that repeats a signature adds reading and drifts. | [] |

### todo-names-its-issue · SHOULD
A to-do comment names its issue; one without an issue is done, filed or removed.

| Why | Tags |
|---|---|
| an issue has an owner and a place in the plan, and a bare to-do is forgotten where it stands. | [] |

## Deprecation

### retired-code-marked-deprecated · SHOULD
Code kept only for its old callers is marked deprecated where it is declared, naming what replaces it.

| Why | Tags |
|---|---|
| the mark stops new callers where they use it, and the replacement it names is the way off. | [] |
