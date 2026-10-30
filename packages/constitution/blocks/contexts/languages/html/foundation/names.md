# Names

> Governs a name in a document: the id of an element.

## General

### id-unique-in-its-document · MUST

An `id` appears once in its document.

| Why |
|---|
| `for`, `aria-labelledby`, `aria-describedby` and a fragment link resolve to the first element with the id, so a second one is never labelled, described or reached. |
