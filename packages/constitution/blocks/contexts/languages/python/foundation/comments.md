# Comments

> Governs a comment in Python: the docstring that documents what a package publishes.

## General

### published-declaration-documented-by-docstring → only-published-declarations-documented-only-where-not-obvious · SHOULD

The documentation of a published declaration is a docstring in the Google form. On a module, class or function a package publishes it holds a one-line summary on its first line, then the `Args:`, `Returns:` and `Raises:` sections it needs or another rule asks for, none of them naming a type the annotation already states. A docstring there only for a section another rule asks for holds its summary and that section, nothing else.

| Why |
|---|
| docstrings in mixed forms read differently in every module, a summary that is not on the first line is lost where `help()` and an editor show only that line, and a type written beside its annotation repeats it and drifts from it. |
