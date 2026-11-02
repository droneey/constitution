# Formatter

> Governs Biome's formatter: the files it formats and the style it writes.

## General

### biome-formats-every-file-it-reads → one-formatter-per-language · MUST

Biome formats every file of the languages it covers, and of no other, with single quotes where the language allows them. Those are code, stylesheets, JSON and YAML, with single quotes in code, stylesheets and YAML.

| Why |
|---|
| two formatters of one language undo each other's work, and a file nobody formats reopens every argument about its layout, as quotes that differ from file to file reopen the argument about them. |
