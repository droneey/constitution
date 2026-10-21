# Names

> Governs the ids of a document's elements.

## General

### id-unique-in-its-document · MUST

An `id` appears once in its document.

| Why | Tags |
|---|---|
| `for`, `aria-labelledby`, `aria-describedby` and a fragment link resolve to the first element with the id, so a second one is never labelled, described or reached. | [a11y] |
