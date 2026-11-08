# YAML

> Governs the code that parses YAML.

## General

### yaml-timestamp-constructed-as-text → reader-resolves-scalars-by-the-core-schema · MUST

Every YAML timestamp the code parses, an explicitly tagged one included, is constructed as text, never as a `date` or a `datetime`.

| Why |
|---|
| YAML 1.2's core schema has no timestamp, yet the Python loaders in common use still build a `!!timestamp` tag as a `date` or a `datetime`, so a value its writer tagged reaches the program built by the loader's rules, not by the program's own parse — YAML 1.2. |

## YAML from outside

### yaml-from-outside-refused-with-an-alias → alias-expansion-bounded · MUST

Every YAML document from outside the program that holds an alias is refused before any value is built from it.

| Why |
|---|
| the Python loaders in common use build an alias as one more reference to the value it names, so a document of a few nested aliases loads small and passes every check of its size, then grows into more data than the program can hold once code walks or writes the value. |
