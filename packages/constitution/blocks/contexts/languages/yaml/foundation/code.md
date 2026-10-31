# Code

> Governs any YAML no other chapter governs: the style of collections.

## General

### collection-written-in-block-style · MUST

A sequence or a mapping is written in block style, one entry to a line; flow style — `[a, b]`, `{key: value}` — is never written, save an empty `[]` or `{}`.

| Why |
|---|
| an entry on a line of its own is read, changed and reviewed one line at a time, and a diff shows the one entry that changed. |
