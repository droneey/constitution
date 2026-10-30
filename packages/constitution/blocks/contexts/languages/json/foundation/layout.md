# Layout

> Governs a JSON file's kind and name: the extension of one that holds comments.

## Names

### json-with-comments-ends-in-jsonc → format-has-one-extension · SHOULD

A JSON file that holds comments or trailing commas ends in `.jsonc`, save a file its reader finds only by a fixed name.

| Why |
|---|
| the extension tells every editor, formatter and reader which grammar the file follows, so none of them reads a comment as an error or strips it. |
