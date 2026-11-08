# Rendering

> Governs how a component or a hook is written and rendered, and what a component renders for nothing.

## Compilation and purity

### react-compiler-on · MUST

Every component and hook is compiled by the React Compiler. Exempt: one the Compiler cannot compile, marked `'use no memo'` with a comment beside it that says why.

#### Why

A component the Compiler skips is memoised by nobody, so it renders again with every render of its parent; `'use no memo'` is the Compiler's documented escape hatch, which React calls temporary (react.dev, `use no memo`).

#### Examples

```ts title="Avoid"
// vite.config.ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
});
```

```ts title="Prefer"
// vite.config.ts
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
});
```

### memoisation-left-to-the-compiler · MUST

No value, function or component is memoised by hand: no `useMemo`, `useCallback` or `memo` is written. Exempt: a value whose identity an effect or a library the Compiler skips depends on, or one profiler evidence asks for, each stated in its suppression.

#### Why

Memoisation written by hand fills components with dependency lists that go stale unseen, memoising what is unsafe and missing what matters, while the Compiler memoises only what is safe to memoise.

#### Examples

```tsx title="Avoid"
export const CartLines = ({ lines, onRemove }: CartLinesProps): ReactElement => {
  const total = useMemo(() => sumLines(lines), [lines]);
  const remove = useCallback((lineId: LineId) => onRemove(lineId), [onRemove]);

  return <LineList lines={lines} total={total} onRemove={remove} />;
};
```

```tsx title="Prefer"
export const CartLines = ({ lines, onRemove }: CartLinesProps): ReactElement => (
  <LineList lines={lines} total={sumLines(lines)} onRemove={onRemove} />
);
```

### render-is-pure → function-answers-or-changes · MUST

Every component's and hook's render is pure. For the same props, state and context it returns the same output, changes nothing that existed before the render and reads no ref during it.

#### Why

The Compiler and concurrent rendering run a render more than once; one that is not pure behaves differently each time.

#### Examples

```tsx title="Avoid"
let renderCount = 0;

export const OrderRow = ({ order }: OrderRowProps): ReactElement => {
  renderCount += 1;

  return <tr data-at={Date.now()}>{order.number}</tr>;
};
```

```tsx title="Prefer"
export const OrderRow = ({ order }: OrderRowProps): ReactElement => (
  <tr>{order.number}</tr>
);
```

### root-renders-in-strict-mode · SHOULD

Every React root renders inside `StrictMode`.

#### Why

Without `StrictMode`, a render that is not pure or an effect that does not clean up passes development and shows first in production; `StrictMode` renders and runs each effect twice while the program is developed — fail fast.

#### Examples

```tsx title="Avoid"
createRoot(container).render(<App />);
```

```tsx title="Prefer"
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

## Components and hooks

### modern-react-api-only → deprecated-form-never-used · MUST

Only React's modern API is used. That is `use(Context)`, `<Context value>`, `ref` as a prop and ref callbacks that return their cleanup, never the legacy form of each.

#### Why

A legacy form is one React deprecates or announces for deprecation, so a later release breaks the code still on it, and two forms of one thing double what a reader must know; `use(Context)` also reads in a condition.

#### Examples

```tsx title="Avoid"
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  const theme = useContext(ThemeContext);

  return <input ref={ref} className={theme.field} {...props} />;
});
```

```tsx title="Prefer"
export const TextField = ({ ref, ...props }: TextFieldProps): ReactElement => {
  const theme = use(ThemeContext);

  return <input ref={ref} className={theme.field} {...props} />;
};
```

### function-components-only → behaviour-composed-not-inherited · MUST

Every component is a function, composed, never inherited. Exempt: an error boundary, which React still requires to be a class.

#### Why

A class component cannot call a hook, and inheritance between components couples each to its parent's internals — composition over inheritance.

#### Examples

```tsx title="Avoid"
export class OrderSummary extends Component<OrderSummaryProps> {
  render(): ReactElement {
    return <p>{formatMoney(this.props.order.total)}</p>;
  }
}
```

```tsx title="Prefer"
export const OrderSummary = ({ order }: OrderSummaryProps): ReactElement => (
  <p>{formatMoney(order.total)}</p>
);
```

### hooks-at-top-level · MUST

Every hook is called at the top level of a component or a hook, never inside a condition, loop or callback.

#### Why

React matches hooks by their call order; a hook called conditionally reads another hook's state.

#### Examples

```tsx title="Avoid"
export const OrderNotes = ({ order }: OrderNotesProps): ReactElement | null => {
  if (order.notes.length === 0) {
    return null;
  }

  const [isExpanded, setIsExpanded] = useState(false);

  return <NoteList notes={order.notes} isExpanded={isExpanded} onToggle={setIsExpanded} />;
};
```

```tsx title="Prefer"
export const OrderNotes = ({ order }: OrderNotesProps): ReactElement | null => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (order.notes.length === 0) {
    return null;
  }

  return <NoteList notes={order.notes} isExpanded={isExpanded} onToggle={setIsExpanded} />;
};
```

### component-never-defined-inside-a-component · MUST

No component is defined inside another component.

#### Why

A component defined inside another is a new type on every render, so its state resets each time.

#### Examples

```tsx title="Avoid"
export const OrderList = ({ orders }: OrderListProps): ReactElement => {
  const OrderItem = ({ order }: OrderItemProps): ReactElement => <li>{order.number}</li>;

  return <ul>{orders.map((order) => <OrderItem key={order.id} order={order} />)}</ul>;
};
```

```tsx title="Prefer"
const OrderItem = ({ order }: OrderItemProps): ReactElement => <li>{order.number}</li>;

export const OrderList = ({ orders }: OrderListProps): ReactElement => (
  <ul>{orders.map((order) => <OrderItem key={order.id} order={order} />)}</ul>
);
```

## What it renders

### list-keys-from-identity · MUST

Every list item's key comes from the item's identity, never its index.

#### Why

An index key moves state to the wrong item when the list is reordered or filtered.

#### Examples

```tsx title="Avoid"
<ul>
  {lines.map((line, index) => (
    <CartLineRow key={index} line={line} />
  ))}
</ul>
```

```tsx title="Prefer"
<ul>
  {lines.map((line) => (
    <CartLineRow key={line.id} line={line} />
  ))}
</ul>
```

### null-written-only-where-react-uses-it → undefined-is-the-only-absence · MUST

All code writes `null` only where React's API uses it. Those places are the output of nothing, from a component typed `ReactElement | null` or from a branch of what it renders, and a ref object, `useRef<T>(null)` or `RefObject<T | null>`. Exempt: a `null` an outside format or another API the code calls uses, as `undefined-is-the-only-absence` allows.

#### Why

React's own absence of output is `null`, and a component returning `undefined` reads as a forgotten return.

#### Examples

```ts title="Avoid"
type CheckoutState = {
  coupon: Coupon | null;
  selectedAddressId: AddressId | null;
};
```

```ts title="Prefer"
type CheckoutState = {
  coupon?: Coupon;
  selectedAddressId?: AddressId;
};
```
