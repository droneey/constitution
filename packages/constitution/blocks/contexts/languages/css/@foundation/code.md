# Code

> Governs what a stylesheet is, and any stylesheet code no other chapter governs: the classes a stylesheet declares.

## Vocabulary

A **stylesheet** is a **`.css`**{#stylesheet} file.

The **entry stylesheet** is the stylesheet a program's entry file loads, which imports every other stylesheet of the program.

## Dead code

### class-declared-is-used → dead-code-deleted · MUST

Every class a stylesheet declares is used by markup. Exempt: a class a package offers other packages through the stylesheet it publishes.

#### Why

An unused class is dead code nobody dares delete, since nothing in the stylesheet shows that it styles nothing.

#### Examples

```css title="Avoid"
@layer components {
  .order-badge {
    border-radius: var(--radius-pill);
  }

  .order-badge-legacy { /* no markup uses it since the redesign */
    border-radius: 0.25rem;
  }
}
```

```css title="Prefer"
@layer components {
  .order-badge {
    border-radius: var(--radius-pill);
  }
}
```
