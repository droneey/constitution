# Custom properties

> Governs custom properties: where they are read, and how an animated one is typed.

## General

### custom-property-read-where-defined · MUST

Every custom property is read only where it is defined. It is read only through `var()`, and only where `@property` registers it with an initial value, where a rule that matches the element or one of its ancestors defines it, or with a fallback written in its `var()`.

#### Why

A custom property nothing defines resolves to an invalid value, and the declaration that reads it silently falls back to the inherited or initial value.

#### Examples

```css title="Avoid"
@layer components {
  .order-card {
    border-color: var(--order-card-accent); /* nothing defines it */
  }
}
```

```css title="Prefer"
@layer components {
  .order-card {
    --order-card-accent: var(--color-border);
    border-color: var(--order-card-accent);
  }

  .order-card[data-status="overdue"] {
    --order-card-accent: var(--color-danger);
  }
}
```

### animated-custom-property-registered · MUST

Every custom property that is animated or transitioned is registered by `@property` with its syntax, its inheritance and a valid initial value.

#### Why

An unregistered property is plain text to the browser: it jumps instead of animating, and a value of the wrong type passes until it breaks the declaration that reads it.

#### Examples

```css title="Avoid"
@layer components {
  .upload-progress {
    --upload-progress-angle: 0deg;
    background: conic-gradient(var(--color-action) var(--upload-progress-angle), transparent 0);
    transition: --upload-progress-angle 300ms ease-out;
  }
}
```

```css title="Prefer"
@property --upload-progress-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

@layer components {
  .upload-progress {
    background: conic-gradient(var(--color-action) var(--upload-progress-angle), transparent 0);
    transition: --upload-progress-angle 300ms ease-out;
  }
}
```
