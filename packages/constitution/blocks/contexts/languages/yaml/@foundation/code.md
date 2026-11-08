# Code

> Governs any YAML no other chapter governs: the style of collections.

## Collections

### collection-never-written-in-flow-style · MUST

Every sequence and every mapping is written in block style, one entry to a line, never in flow style. Flow style writes it within brackets or braces, as `[a, b]` or `{key: value}`. Exempt: an empty collection, written `[]` or `{}`, and a file whose form a tool generates.

| Why |
|---|
| a collection in flow style changes as one line, so a diff shows the whole collection for the one entry that changed, and a review misses which. |
