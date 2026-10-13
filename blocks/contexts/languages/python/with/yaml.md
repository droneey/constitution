# Python with YAML

> Governs the code that reads YAML from outside the program.

## Security

### yaml-from-outside-loaded-by-a-safe-loader-only → outside-yaml-loaded-by-a-safe-loader · MUST
Code that loads YAML from outside the program uses a safe loader — `safe_load`, or a loader of the `safe` type — and never a full or an unsafe one.

| Why | Tags |
|---|---|
| a full loader builds whatever object a tag names, so the file's author runs code in the program. | [security] |
