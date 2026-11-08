# Reader

> Governs the adapter that parses the config file and what a feature knows of the file.

## General

### config-file-parsed-by-its-adapter → outside-value-parsed-once-where-it-enters · MUST

Every config file is parsed in the adapter that reads it, which alone holds the config schema.

| Why |
|---|
| a config schema held past the adapter ties code that never reads the file to that file's format and to the library it is parsed with, so a change of either reaches that code — ports and adapters. |

### feature-blind-to-the-config-file → port-declared-by-the-layer-that-needs-it · SHOULD

Wherever several features take a section of the config file, only the composition module that splits the parsed file sees it whole. No feature reads the file, and every feature receives an input built from its own section, in its own words.

| Why |
|---|
| a feature that reads the file depends on every other feature's section and on the file's format, so a change to any of them reaches it. |
