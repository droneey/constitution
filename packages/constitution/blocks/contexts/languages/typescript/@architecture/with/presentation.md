# Presentation

> Governs the input and output a TypeScript component never reaches.

## Components

### component-reaches-no-io-global → effects-held-only-by-the-edge · MUST

No file in a `components/` folder calls an input or output global. Such a global is one the runtime offers every module without an import, such as `fetch`.

#### Why

Such a global reaches a component without an import, so nothing at the top of its file shows the effect, the import rules that keep effects at the edge never see it, and a component that fetches can no longer be shown or tested with plain data.

#### Examples

```tsx title="Avoid"
// src/features/cart/presentation/components/cart-badge/cart-badge.tsx
export const CartBadge = (): ReactElement => {
  const count = Number(localStorage.getItem('cart-count') ?? '0');
  return <span className={styles.badge}>{count}</span>;
};
```

```tsx title="Prefer"
// src/features/cart/presentation/components/cart-badge/cart-badge.tsx
export const CartBadge = ({ count }: CartBadgeProps): ReactElement => (
  <span className={styles.badge}>{count}</span>
);
```
