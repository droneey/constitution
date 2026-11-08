# Motion

> Governs motion in a stylesheet: its transitions and the properties they name.

## General

### transition-names-its-properties · MUST

Every transition names the properties it animates, in `transition` or `transition-property`, never `all`.

#### Why

`all` also moves what nobody meant to move (a layout property, every colour when the colour scheme switches, a property a later change adds) and each one that changes is animated, a layout property with a new layout every frame.

#### Examples

```css title="Avoid"
@layer components {
  .checkout-button {
    transition: all 150ms ease-out;
  }
}
```

```css title="Prefer"
@layer components {
  .checkout-button {
    transition:
      background-color 150ms ease-out,
      color 150ms ease-out;
  }
}
```
