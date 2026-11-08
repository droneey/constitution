# Formatter

> Governs Biome's formatter: the files it formats and the quotes it writes.

## General

### biome-formats-every-file-of-its-languages → formatter-covers-every-file-of-its-language · MUST

Every TypeScript, JavaScript, CSS, JSON or YAML file is formatted by Biome, and no file of another language.

| Why |
|---|
| a file its formatter leaves out reopens every argument about its layout, and a file of a language Biome does not cover is undone by the formatter that does. |

### biome-writes-single-quotes · MUST

Every string Biome formats in TypeScript, JavaScript, CSS or YAML takes single quotes where the language allows them.

| Why |
|---|
| quotes that differ from file to file reopen the argument about them in every review, and a diff fills with lines whose only change is a quote. |
