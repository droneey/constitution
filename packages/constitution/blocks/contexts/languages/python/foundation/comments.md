# Comments

> Governs docstrings.

## General

### published-declaration-documented-by-docstring → published-declaration-documented-only-where-not-obvious · SHOULD

The documentation of a module, class or function a package publishes is a docstring in the Google form: a one-line summary on its first line, then the `Args:`, `Returns:` and `Raises:` sections it needs or another rule asks for, none of them naming a type the annotation already states. A docstring there only for a section another rule asks for holds its summary and that section, nothing else.

| Why |
|---|
| one form reads the same in every module, the summary on the first line is what `help()` and an editor show first, and a type written beside its annotation repeats it and drifts from it. |
