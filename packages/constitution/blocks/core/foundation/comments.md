# Comments

> Governs a comment and the documentation of what a package publishes.

## General

### comment-says-only-what-the-code-cannot · MUST

A comment says only what the code cannot. The code first says all it can — by a name, a type, an extracted function — and a comment is then one of four kinds and no other. The four are the documentation of what a package publishes; a tool's directive, in the tool's own form, with its reason; a mark another rule asks for; and a reason opened by the reason marker, **`Why:`**{#reason-marker} — a constraint, a workaround, a decision, or a fact of an outside system that the code cannot carry. A comment that stands in for a name, a type or a function is replaced by it, and any other, a to-do among them, is removed. The reason marker is a default, which a language's block respells where its convention opens a kind of reason with a marker of its own.

| Why |
|---|
| a comment that repeats the code stays where it was written while the code changes, so it drifts and misleads the next reader, where a name or a type would have gone with the thing to every use; a comment of no known kind cannot be judged where it stands. |

### only-published-declarations-documented-only-where-not-obvious · SHOULD

Only a published declaration is documented, and only with what its names and types cannot say. A declaration a package publishes — one its published entries lead to, directly or through the files that re-export it — is documented with what it does for a caller, a precondition, a unit, a failure, an effect, a bound or a default, and never restates its names and types. No other declaration is documented, save with what another rule asks for — a mark, a failure no signature names —, so a program no package imports carries only that.

| Why |
|---|
| a package's caller reads its documentation in place of its code, while code inside it is read where it stands, and documentation that repeats a signature adds reading and drifts. |
