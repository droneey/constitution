# Comments

> Governs docstrings and deprecation.

## General

### docstring-only-where-not-obvious → export-documented-only-where-not-obvious · SHOULD

A public module, class or function has a docstring only where its names and annotations leave something unsaid: a precondition, a unit, a failure, an effect.

| Why | Tags |
|---|---|
| a docstring that repeats a signature drifts from it, and the editor already shows the annotations. | [] |

### docstring-in-google-form · SHOULD

A docstring is in the Google form: a one-line summary on its first line, then the `Args:`, `Returns:` and `Raises:` sections it needs.

| Why | Tags |
|---|---|
| one form reads the same in every module, and the summary on the first line is what `help()` and an editor show first. | [] |

## Deprecation

### deprecated-by-decorator → retired-code-marked-deprecated · SHOULD

Code kept only for its old callers is decorated `@warnings.deprecated` with a message that names its replacement.

| Why | Tags |
|---|---|
| the mark warns at every call at run time and flags every call where it is written, both with the message, which a docstring never does. | [] |
