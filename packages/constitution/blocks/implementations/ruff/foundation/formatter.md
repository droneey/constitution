# Formatter

> Governs Ruff's formatter.

## General

### ruff-format-is-the-formatter → one-formatter-per-language · MUST

Ruff formats every Python file, with single quotes and docstrings in double quotes.

| Why |
|---|
| two formatters of Python undo each other's work, and a layout no formatter fixes is argued over in every review. |
