# Selectors

> Governs selectors: their specificity, their classes, their nesting and what they target.

## General

### selector-specificity-never-descends · MUST

Within one cascade layer, no selector follows, in source order, a selector of higher specificity that matches the same element.

#### Why

A later selector that loses to an earlier one on the element both match reads as the one that applies.

#### Examples

```css title="Avoid"
@layer components {
  @scope (.cart-summary) {
    :scope[data-state="due"] .total {
      font-weight: 700;
    }

    .total { /* loses to the rule above when the cart is due */
      font-weight: 600;
    }
  }
}
```

```css title="Prefer"
@layer components {
  @scope (.cart-summary) {
    .total {
      font-weight: 600;
    }

    :scope[data-state="due"] .total {
      font-weight: 700;
    }
  }
}
```

### selector-classes-within-the-limit · MUST

Every selector holds no more classes than the limit the project sets, which is three where it sets none.

#### Why

A selector of many classes stops matching when any one of the markup facts it ties to changes, and its specificity is one every later rule for the element must beat.

#### Examples

```css title="Avoid"
@layer components {
  @scope (.cart-line) {
    .body .price .price-row .amount {
      font-variant-numeric: tabular-nums;
    }
  }
}
```

```css title="Prefer"
@layer components {
  @scope (.cart-line) {
    .amount {
      font-variant-numeric: tabular-nums;
    }
  }
}
```

### nested-rule-within-the-depth-limit · SHOULD

Every nested style rule sits no deeper than the depth the project sets, three levels where it sets none. The depth is counted from the rule outside any nesting.

#### Why

Each level of nesting is a selector the reader must join in their head and specificity the next rule must beat, and the joined selector appears nowhere a search can find it.

#### Examples

```css title="Avoid"
@layer components {
  @scope (.order-table) {
    tbody {
      & tr {
        & td {
          & a {
            text-decoration-thickness: 0.08em;
          }
        }
      }
    }
  }
}
```

```css title="Prefer"
@layer components {
  @scope (.order-table) {
    td {
      & a {
        text-decoration-thickness: 0.08em;
      }
    }
  }
}
```

### selector-never-targets-an-id · MUST

No selector names an `id`.

#### Why

An id selector outweighs every class, so its style can be overridden only by another id, and it styles one element that can never be reused.

#### Examples

```css title="Avoid"
@layer components {
  #checkout-form {
    display: grid;
    gap: var(--space-3);
  }
}
```

```css title="Prefer"
@layer components {
  .checkout-form {
    display: grid;
    gap: var(--space-3);
  }
}
```

### default-style-has-zero-specificity · SHOULD

Every default meant to be overridden has zero specificity. Such defaults include the reset layer's, a base cascade layer's and a library's, and each wraps its selectors in `:where()`.

#### Why

A default with a specificity of its own must be outweighed by every rule that overrides it, so overrides grow their selectors or reach for `!important`, inside its cascade layer or, for a library, in a stylesheet with no cascade layer.

#### Examples

```css title="Avoid"
@layer base {
  a:not([class]) {
    color: var(--color-link);
    text-decoration-thickness: 0.08em;
  }
}
```

```css title="Prefer"
@layer base {
  :where(a:not([class])) {
    color: var(--color-link);
    text-decoration-thickness: 0.08em;
  }
}
```
