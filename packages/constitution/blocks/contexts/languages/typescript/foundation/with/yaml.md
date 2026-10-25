# YAML

> Governs the code that parses YAML.

## General

### yaml-parsed-by-the-core-schema → reader-resolves-scalars-by-the-core-schema · SHOULD

Code that parses YAML sets its parser to YAML 1.2's core schema.

| Why |
|---|
| a parser left to another schema reads `no` as false or a date as a timestamp, and the program reads what the writer never meant. |

## YAML from outside

### yaml-from-outside-parsed-with-no-custom-tags → outside-yaml-loaded-by-a-safe-loader · MUST

Code that parses YAML from outside the program gives its parser no custom tags.

| Why |
|---|
| a custom tag builds the object the sender names, and the file is the sender's to write. |

### yaml-from-outside-parsed-with-an-alias-bound → alias-expansion-bounded · MUST

Code that parses YAML from outside the program sets a bound on the aliases its parser expands.

| Why |
|---|
| a few aliases that point at each other expand into more data than the program can hold. |
