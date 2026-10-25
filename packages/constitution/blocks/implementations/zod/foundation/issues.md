# Issues

> Governs how a schema's issues become details.

## General

### zod-issues-become-error-details → parse-failure-lists-every-problem · SHOULD

Input is parsed with `safeParse`, and each of the error's `issues` becomes a detail, with its `path`.

| Why |
|---|
| `safeParse` returns every issue as a value, and each carries the path to its place. |
