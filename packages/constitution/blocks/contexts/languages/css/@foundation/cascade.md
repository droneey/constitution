# Cascade

> Governs the cascade: each cascade layer, the layer order, the reset layer, and importance.

## Vocabulary

A **cascade layer** is a named part of the cascade that `@layer` declares, and the **layer order** is the order they are declared in, which decides which style rule wins before specificity does.

The **reset layer** is the cascade layer that resets the browser's defaults.

## General

### style-rule-in-a-named-layer · MUST

Every style rule sits in a named cascade layer. No style rule stays outside every cascade layer, and no cascade layer is anonymous.

#### Why

The layer order, not specificity or the file that loaded last, decides which rule wins, so a rule outside every cascade layer beats every rule inside one, and an anonymous cascade layer cannot be named where the layer order is declared.

#### Examples

```css title="Avoid"
@scope (.cart-badge) {
  :scope {
    border-radius: var(--radius-pill);
  }
}

@layer {
  @scope (.cart-badge) {
    .count {
      font-variant-numeric: tabular-nums;
    }
  }
}
```

```css title="Prefer"
@layer components {
  @scope (.cart-badge) {
    :scope {
      border-radius: var(--radius-pill);
    }

    .count {
      font-variant-numeric: tabular-nums;
    }
  }
}
```

### layer-order-declared-first-in-the-entry-stylesheet · MUST

The layer order is declared at the top of the entry stylesheet, before any cascade layer is filled.

#### Why

A cascade layer filled before the layer order is declared takes its place in it by accident, so its styles win over others, or lose to them, in an order nobody chose.

#### Examples

```css title="Avoid"
/* src/styles/main.css */
@import "./components.css" layer(components);
@import "./reset.css" layer(reset);
@layer reset, base, theme, components;
```

```css title="Prefer"
/* src/styles/main.css */
@layer reset, base, theme, components;

@import "./reset.css" layer(reset);
@import "./components.css" layer(components);
```

### declaration-never-important · MUST

No declaration is `!important`. Exempt: a declaration of the reset layer that keeps a user's preference, such as reduced motion, or that hides `[hidden]`.

#### Why

`!important` reverses the layer order and can be beaten only by another `!important`, so every use invites the next, where a later cascade layer would have won without it.

#### Examples

```css title="Avoid"
/* src/styles/main.css */
@layer reset, base, components, vendor;

@import "data-grid/styles.css" layer(vendor);

@layer components {
  @scope (.order-table) {
    td {
      padding-block: 0.5rem !important;
    }
  }
}
```

```css title="Prefer"
/* src/styles/main.css */
@layer reset, vendor, base, components;

@import "data-grid/styles.css" layer(vendor);

@layer components {
  @scope (.order-table) {
    td {
      padding-block: 0.5rem;
    }
  }
}
```
