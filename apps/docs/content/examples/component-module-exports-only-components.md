```tsx title="Avoid"
export const useCart = (): Cart => useContext(CartContext);

export const CartSummary = (): ReactElement => <Total of={useCart()} />;
```

```tsx title="Prefer"
// use-cart.ts
export const useCart = (): Cart => useContext(CartContext);

// cart-summary.tsx
export const CartSummary = (): ReactElement => <Total of={useCart()} />;
```
