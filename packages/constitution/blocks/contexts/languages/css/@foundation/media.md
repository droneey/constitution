# Media

> Governs media queries: how breakpoints build on the smallest screen, and the hover a style decorates.

## Breakpoints

### breakpoints-add-to-the-smallest-screen · SHOULD

Every breakpoint adds styles from a minimum width to base styles that serve the smallest screen. It never undoes for narrow screens a style set for wide ones.

#### Why

A style set for wide screens must be undone in full for narrow ones, and what an undo misses breaks the smallest screen, which nobody on a wide one sees — mobile first.

#### Examples

```css title="Avoid"
@layer layouts {
  .checkout-layout {
    display: grid;
    grid-template-columns: 1fr 22rem;
  }

  @media (width < 48rem) {
    .checkout-layout {
      grid-template-columns: 1fr;
    }
  }
}
```

```css title="Prefer"
@layer layouts {
  .checkout-layout {
    display: grid;
  }

  @media (width >= 48rem) {
    .checkout-layout {
      grid-template-columns: 1fr 22rem;
    }
  }
}
```

## Hover

### hover-effect-behind-hover-media · SHOULD

Every style that only decorates hover sits inside `@media (hover: hover)`.

#### Why

A touch screen applies hover on a tap and keeps it until the next tap elsewhere, so the decoration sticks to whatever was touched last.

#### Examples

```css title="Avoid"
@layer components {
  .product-card:hover {
    box-shadow: var(--shadow-raised);
  }
}
```

```css title="Prefer"
@layer components {
  @media (hover: hover) {
    .product-card:hover {
      box-shadow: var(--shadow-raised);
    }
  }
}
```
