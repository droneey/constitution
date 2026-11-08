# Names

> Governs a name in a stylesheet: what a class is named for, and its case.

## Meaning

### class-named-for-what-the-element-is → name-reveals-intent · SHOULD

Every class the project declares names what its element is, never how it looks.

#### Why

A name that says what an element is stays true when its look changes; one that says how it looks lies after the first redesign.

#### Examples

```css title="Avoid"
@layer components {
  .red-bold-text {
    color: var(--color-danger);
    font-weight: 700;
  }
}
```

```css title="Prefer"
@layer components {
  .overdue-notice {
    color: var(--color-danger);
    font-weight: 700;
  }
}
```

## Form

### class-name-in-kebab-case → name-case-by-kind · SHOULD

Every class the project declares is written in kebab-case.

#### Why

A class spelled in two cases is two classes to the browser, so markup that spells it the other way stays unstyled, and a search for one spelling misses the other.

#### Examples

```css title="Avoid"
@layer components {
  @scope (.orderSummary) {
    :scope {
      display: grid;
    }

    .order_total {
      font-weight: 600;
    }
  }
}
```

```css title="Prefer"
@layer components {
  @scope (.order-summary) {
    :scope {
      display: grid;
    }

    .order-total {
      font-weight: 600;
    }
  }
}
```
