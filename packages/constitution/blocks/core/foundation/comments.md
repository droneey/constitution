# Comments

> Governs a comment, the documentation of an exported declaration, a mark of deprecation.

## General

### comment-explains-why · MUST

The code first says all it can — by a name, a type, an extracted function — and a comment states only what is still left, such as a constraint, a workaround or an alternative the code turned down, or what another rule asks for. A comment that stands in for a name, a type or a function the code could carry is replaced by it, and one that states nothing still left is removed.

| Why |
|---|
| a name or a type goes with the thing to every use and changes with it, while a comment stays where it was written, repeats the code and drifts from it. |

### export-documented-only-where-not-obvious · SHOULD

The documentation of an exported declaration states only what its names and types cannot — a precondition, a unit, a failure, an effect, a bound — and never restates them.

| Why |
|---|
| documentation that repeats a signature adds reading and drifts. |

### todo-names-its-issue · SHOULD

A to-do comment names its issue; one without an issue is done, filed or removed.

| Why |
|---|
| an issue has an owner and a place in the plan, and a bare to-do is forgotten where it stands. |

## Deprecation

### retired-code-marked-deprecated · SHOULD

Code kept only for its old callers is marked deprecated where it is declared, naming what replaces it.

| Why |
|---|
| the mark stops new callers where they use it, and the replacement it names is the way off. |
