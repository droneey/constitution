# Code

> Governs any YAML no other chapter governs: the style of collections.

## General

### collection-written-in-block-style · MUST

A sequence or a mapping is written in block style, one entry to a line. Flow style — `[a, b]`, `{key: value}` — is never written, save an empty `[]` or `{}`.

| Why |
|---|
| a collection in flow style changes as one line, so a diff shows the whole collection for the one entry that changed, and a review misses which. |
