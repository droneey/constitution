# Code

> Governs any JSON no other chapter governs: the syntax a file is written in.

## Syntax

### json-file-strict-unless-its-reader-takes-comments · MUST

A `.json` file is strict JSON, as RFC 8259 defines it — no comments, no trailing commas — save a file whose every reader takes comments.

| Why |
|---|
| a strict reader refuses the whole file for one comment, as a linter may refuse one in its own configuration, and a file several tools read is read by the strictest of them. |
