# Text

> Governs how text is set: the height of its lines.

## General

### line-height-set-as-a-number · MUST

Every line height is a unitless number, such as `1.5`, or `normal`, never a length or a percentage. That holds in `line-height`, in the `font` shorthand and in a custom property that holds a line height alike.

#### Why

A number is inherited as a factor each element multiplies by its own font size, while a length or a percentage is computed once where it is set and inherited as that length, so larger text inside the element gets lines too tight for it, and they overlap.

#### Examples

```css title="Avoid"
@layer base {
  :where(body) {
    font: 1rem/24px var(--font-family-body);
  }
}
```

```css title="Prefer"
@layer base {
  :where(body) {
    font: 1rem/1.5 var(--font-family-body);
  }
}
```
