# Text

> Governs how text is set: the height of its lines and how they wrap.

## General

### line-height-set-as-a-number · MUST

A line height, in `line-height` or in the `font` shorthand, is a unitless number, `1.5`, or a custom property that holds one, never a length or a percentage.

| Why |
|---|
| a number is inherited as a factor each element multiplies by its own font size, while a length or a percentage is computed once where it is set and inherited as that length, so larger text inside the element gets lines too tight for it, and they overlap. |

### short-text-wrapped-to-balance · SHOULD

A heading wraps with `text-wrap: balance`, and a short paragraph — a description, a caption — with `text-wrap: pretty`; long-form text takes neither.

| Why |
|---|
| balanced lines keep a heading from ending on a lone word and pretty ones keep a short text's last line from holding one, while past a few lines the browser balances nothing, and re-wrapping every paragraph of a long page costs layout time no reader sees. |
