# Comments

> Governs a comment in Python: the docstring that documents a declaration.

## General

### declaration-documented-by-a-docstring · MUST

Every declaration that is documented is documented by a docstring that opens with a one-line summary on its first line. The parameters, the return value and the failures it documents stand after the summary, under the headings `Args:`, `Returns:` and `Raises:`.

| Why |
|---|
| docstrings in mixed forms read differently in every module, a summary that is not on the first line is lost where `help()` and an editor show only that line, and a section under another heading is missed by the documentation generators that read these. |
