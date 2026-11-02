# YAML

> Governs the code that parses YAML.

## General

### yaml-read-by-a-yaml-1-2-loader → reader-resolves-scalars-by-the-core-schema · SHOULD

YAML is read by YAML 1.2's core schema. Code that parses YAML reads it so, with the timestamp tag constructed as text, never by a loader whose resolver follows YAML 1.1.

| Why |
|---|
| a resolver of YAML 1.1 reads `no` as false and `1:20` as 80, and a loader that keeps its timestamps reads a date as a `date`, so the program reads what the writer never meant — YAML 1.2. |

## YAML from outside

### yaml-from-outside-refused-with-an-alias → alias-expansion-bounded · MUST

YAML from outside that holds an alias is refused before it is loaded. Code that loads YAML from outside the program finds the alias among its parser's events.

| Why |
|---|
| no Python loader bounds the aliases it expands, so a few aliases that point at each other grow into more data than the program can hold once it walks or writes the value. |
