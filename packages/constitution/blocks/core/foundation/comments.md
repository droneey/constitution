# Comments

> Governs a comment and the documentation of what a package publishes.

## General

### comment-explains-why · MUST

The code first says all it can — by a name, a type, an extracted function — and a comment is then one of four kinds and no other: the documentation of what a package publishes; a tool's directive, in the tool's own form, with its reason; a mark another rule asks for; a reason opened by `Why:` — a constraint, a workaround, a decision, or a fact of an outside system that the code cannot carry. A comment that stands in for a name, a type or a function is replaced by it, and any other, a to-do among them, is removed.

| Why |
|---|
| a name or a type goes with the thing to every use and changes with it, while a comment stays where it was written, repeats the code and drifts from it; a comment of a known kind is judged where it stands. |

### published-declaration-documented-only-where-not-obvious · SHOULD

A declaration a package publishes — one its published entries lead to, directly or through the files that re-export it — is documented with only what its names and types cannot say — what it does for a caller, a precondition, a unit, a failure, an effect, a bound, a default — and never restates them. No other declaration is documented, save by the marks another rule asks for, so an application, which no package imports, carries only those marks.

| Why |
|---|
| a package's caller reads its documentation in place of its code, while code inside it is read where it stands, and documentation that repeats a signature adds reading and drifts. |
