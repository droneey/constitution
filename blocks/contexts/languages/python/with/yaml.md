# Python with YAML

> Governs the code that parses YAML.

## Types

### yaml-read-by-a-yaml-1-2-loader → reader-resolves-scalars-by-the-core-schema · SHOULD
Code that parses YAML reads it by a loader of YAML 1.2, such as ruamel.yaml's `YAML(typ='safe')`, never by PyYAML, whose resolver follows YAML 1.1.

| Why | Tags |
|---|---|
| PyYAML's `safe_load` reads `no` as false and `1:20` as 80, so the program reads what the writer never meant. | [data] |


## Security

### yaml-from-outside-loaded-by-a-safe-loader-only → outside-yaml-loaded-by-a-safe-loader · MUST
Code that loads YAML from outside the program uses a safe loader — `YAML(typ='safe')`, or PyYAML's `safe_load` — and never a full or an unsafe one.

| Why | Tags |
|---|---|
| a full loader builds whatever object a tag names, so the file's author runs code in the program. | [security] |


### yaml-from-outside-refused-with-an-alias → alias-expansion-bounded · MUST
Code that loads YAML from outside the program refuses a document that holds an alias — an `AliasEvent` among its parser's events — before it loads it.

| Why | Tags |
|---|---|
| no Python loader bounds the aliases it expands, so a few aliases that point at each other grow into more data than the program can hold once it walks or writes the value. | [security] |
