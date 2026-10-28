# Comments

> Governs docstrings and deprecation.

## General

### docstring-only-where-not-obvious → published-declaration-documented-only-where-not-obvious · SHOULD

A module, class or function a package publishes has a docstring only where its names and annotations leave something unsaid: what it does for a caller, a precondition, a unit, a failure, an effect, a bound, a default. Any other has none, save the marks another rule asks for.

| Why |
|---|
| a docstring that repeats a signature drifts from it, and the editor already shows the annotations. |

### docstring-in-google-form · SHOULD

A docstring is in the Google form: a one-line summary on its first line, then the `Args:`, `Returns:` and `Raises:` sections it needs or another rule asks for. A docstring there only for a section another rule asks for holds its summary and that section, nothing else.

| Why |
|---|
| one form reads the same in every module, and the summary on the first line is what `help()` and an editor show first, so even a docstring held to one section keeps it. |

## Deprecation

### deprecated-by-decorator → retired-code-marked-deprecated · SHOULD

Code kept only for its old callers is decorated `@warnings.deprecated` with a message that names its replacement.

| Why |
|---|
| the mark warns at every call at run time and flags every call where it is written, both with the message, which a docstring never does. |
