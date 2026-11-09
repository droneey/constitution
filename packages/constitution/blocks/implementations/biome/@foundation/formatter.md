# Formatter

> Governs Biome's formatter: the files it formats and the quotes it writes.

## General

### biome-formats-every-file-of-its-languages → formatter-covers-every-file-of-its-language · MUST

Every TypeScript, JavaScript, CSS, JSON or YAML file is formatted by Biome, and no file of another language.

#### Why

A file its formatter leaves out reopens every argument about its layout, and a file of a language Biome does not cover is undone by the formatter that does.

#### Examples

```jsonc title="Avoid"
// biome.jsonc
{
  "files": {
    "includes": ["src/**/*.ts", "!src/**/*.css"]
  },
  "markdown": { "formatter": { "enabled": true } }
}
```

```jsonc title="Prefer"
// biome.jsonc
{
  "files": {
    "includes": ["**", "!**/dist"]
  },
  "markdown": { "formatter": { "enabled": false } }
}
```

### biome-writes-single-quotes · MUST

Every string Biome formats in TypeScript, JavaScript, CSS or YAML takes single quotes where the language allows them.

#### Why

Quotes that differ from file to file reopen the argument about them in every review, and a diff fills with lines whose only change is a quote.

#### Examples

```jsonc title="Avoid"
// biome.jsonc
{
  "javascript": { "formatter": { "quoteStyle": "double" } }
}
```

```jsonc title="Prefer"
// biome.jsonc
{
  "javascript": { "formatter": { "quoteStyle": "single", "jsxQuoteStyle": "single" } },
  "css": { "formatter": { "quoteStyle": "single" } }
}
```
