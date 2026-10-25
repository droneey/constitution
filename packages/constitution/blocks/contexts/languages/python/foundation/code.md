# Code

> Governs how Python handles paths.

## General

### path-handled-by-pathlib · SHOULD

A file-system path is a `pathlib.Path`, joined with `/` and read through its methods, never a string built with `os.path`.

| Why |
|---|
| one object joins, resolves and reads a path, where a string path is joined by hand and a separator or a `..` slips through. |
