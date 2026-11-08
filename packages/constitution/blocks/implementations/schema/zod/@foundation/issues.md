# Issues

> Governs how a schema's issues become details.

## General

### zod-issues-become-error-details → parse-failure-lists-every-problem · SHOULD

Every issue of a failed parse becomes a detail of the error, with its `path`. Input is parsed with `safeParse`, or `safeParseAsync` where the schema is asynchronous, and each of the error's `issues` becomes one detail.

| Why |
|---|
| a parse that throws, or reports one issue, hides the input's other problems, so the caller fixes one and meets the next on each try; `safeParse` and `safeParseAsync` return every issue as a value, each with the path to its place. |
