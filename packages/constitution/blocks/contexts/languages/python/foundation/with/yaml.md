# YAML

> Governs the code that parses YAML.

## General

### yaml-read-by-a-yaml-1-2-loader → reader-resolves-scalars-by-the-core-schema · SHOULD

Code that parses YAML uses a YAML 1.2 loader — `ruamel.yaml`'s safe loader, never PyYAML, whose every loader resolves by YAML 1.1 — with the timestamp tag constructed as text.

| Why |
|---|
| a resolver of YAML 1.1 reads `no` as false and `1:20` as 80, and a loader that keeps its timestamps reads a date as a `date`, so the program reads what the writer never meant. |

## YAML from outside

### yaml-from-outside-refused-with-an-alias → alias-expansion-bounded · MUST

Code that loads YAML from outside the program refuses a document that holds an alias, found among its parser's events, before it loads it.

| Why |
|---|
| no Python loader bounds the aliases it expands, so a few aliases that point at each other grow into more data than the program can hold once it walks or writes the value. |
