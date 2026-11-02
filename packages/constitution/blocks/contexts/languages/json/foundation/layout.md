# Layout

> Governs a JSON file's kind and name: the extension of one that holds comments.

## Names

### json-with-comments-ends-in-jsonc → format-has-one-extension · SHOULD

A JSON file that holds comments or trailing commas ends in `.jsonc`. A file its reader finds only by a fixed name is exempt.

| Why |
|---|
| a file that ends in `.json` and holds comments is read as strict JSON by every editor, formatter and reader that trusts its extension, which then reports the comment as an error or strips it. |
