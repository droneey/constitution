# Components

> Governs a component's name, its hidden parts, a compound, its children, its controllable props and what its module exports.

## Vocabulary

A compound's or a provider's context lives in a file ending in **`.context`**{#component-context}.

## Names

### components-named-in-pascal-case → name-cased-by-the-typescript-conventions · MUST

Every component is named in PascalCase.

#### Why

React renders a lower-case name as an element of the platform, so a component named so is never rendered as itself.

#### Examples

```tsx title="Avoid"
export const cartSummary = ({ cart }: CartSummaryProps): ReactElement => (
  <p>{formatMoney(cart.total)}</p>
);
```

```tsx title="Prefer"
export const CartSummary = ({ cart }: CartSummaryProps): ReactElement => (
  <p>{formatMoney(cart.total)}</p>
);
```

## Hidden parts

### hidden-state-kept-by-activity · MUST

Every part of a screen the user switches away from and back to is hidden by `<Activity mode="hidden">` while away. Such a part, such as a tab panel or a step, is neither unmounted nor hidden by a style alone. Exempt: a region a change of size hides, which `size-change-keeps-the-users-state` governs.

#### Why

Unmounting loses the state the user left in the part, and a part hidden by a style alone keeps its effects running.

#### Examples

```tsx title="Avoid"
export const OrderTabs = ({ tab }: OrderTabsProps): ReactElement => (
  <>
    {tab === 'details' && <OrderDetails />}
    <div style={{ display: tab === 'notes' ? 'block' : 'none' }}>
      <OrderNotes />
    </div>
  </>
);
```

```tsx title="Prefer"
export const OrderTabs = ({ tab }: OrderTabsProps): ReactElement => (
  <>
    <Activity mode={tab === 'details' ? 'visible' : 'hidden'}>
      <OrderDetails />
    </Activity>
    <Activity mode={tab === 'notes' ? 'visible' : 'hidden'}>
      <OrderNotes />
    </Activity>
  </>
);
```

## Compounds

### compound-part-reached-only-through-its-root → component-with-regions-is-a-compound · MUST

Every compound's part is reached only through its root, as `Root.Part`. The compound exports only its root and its prop types.

#### Why

A part imported on its own renders outside its root and loses what the root shares with it, and the dot names the compound a part belongs to.

#### Examples

```tsx title="Avoid"
// src/presentation/components/order-card/index.ts
export { OrderCard, OrderCardHeader, OrderCardTotal } from './order-card';

// src/presentation/screens/order/order.tsx
<OrderCard>
  <OrderCardHeader order={order} />
  <OrderCardTotal order={order} />
</OrderCard>
```

```tsx title="Prefer"
// src/presentation/components/order-card/index.ts
export { OrderCard } from './order-card';
export type { OrderCardProps } from './order-card';

// src/presentation/screens/order/order.tsx
<OrderCard>
  <OrderCard.Header order={order} />
  <OrderCard.Total order={order} />
</OrderCard>
```

### compound-part-keyed-in-pascal-case → name-cased-by-the-typescript-conventions · MUST

Every key that attaches a compound's part to its root, in its typed `Object.assign`, is PascalCase, and no other key is. Exempt: a key a contract imposes, as `name-cased-by-the-typescript-conventions` allows.

#### Why

The key names the component the part is, so a camelCase key reads as a value at `Root.part`, and a PascalCase key that is no part reads as a component a reader looks for in vain; the typed `Object.assign` gives the root's type its parts, and it is where the lint plugin tells a part's key from any other.

#### Examples

```tsx title="Avoid"
export const OrderCard = Object.assign(OrderCardRoot, {
  header: OrderCardHeader,
  total: OrderCardTotal,
});
```

```tsx title="Prefer"
export const OrderCard: typeof OrderCardRoot & {
  Header: typeof OrderCardHeader;
  Total: typeof OrderCardTotal;
} = Object.assign(OrderCardRoot, { Header: OrderCardHeader, Total: OrderCardTotal });
```

### compound-state-shared-through-its-context → component-with-regions-is-a-compound · SHOULD

Every compound's root shares its state with its parts through its context, in `<name>.context.ts`, never through props the consumer threads. The choreography of its animated regions is shared the same way.

#### Why

Props threaded through the consumer's markup make every consumer wire what the root decides, and each new part adds a prop to every place the compound is used.

#### Examples

```tsx title="Avoid"
<Accordion openId={openId} onOpenIdChange={setOpenId}>
  <Accordion.Item id="shipping" openId={openId} onOpenIdChange={setOpenId} />
  <Accordion.Item id="billing" openId={openId} onOpenIdChange={setOpenId} />
</Accordion>
```

```tsx title="Prefer"
// accordion.context.ts
export const AccordionContext = createContext<AccordionState | undefined>(undefined);

// accordion-item.tsx
export const AccordionItem = ({ id, children }: AccordionItemProps): ReactElement => {
  const accordion = useAccordion();

  return <section hidden={accordion.openId !== id}>{children}</section>;
};
```

### compound-region-takes-children → component-with-regions-is-a-compound · SHOULD

Every region of a compound takes the caller's content as the children of its part, never as a prop of the root.

#### Why

A prop per region grows the root's props with each region and moves the caller's content out of the markup it sits in, while a part's children keep it where it renders.

#### Examples

```tsx title="Avoid"
<OrderCard
  header={<OrderNumber order={order} />}
  footer={<OrderTotal order={order} />}
/>
```

```tsx title="Prefer"
<OrderCard>
  <OrderCard.Header>
    <OrderNumber order={order} />
  </OrderCard.Header>
  <OrderCard.Footer>
    <OrderTotal order={order} />
  </OrderCard.Footer>
</OrderCard>
```

## Props

### children-typed-by-their-use · MUST

Every slot's or container's children are typed by what it does with them. A slot that keeps control of its element takes a `ReactElement`, a container takes `ReactNode`, and a render-prop slot is `(children, …data) => ReactElement`.

#### Why

A slot typed wider than it handles accepts a string or a list it cannot control, and its caller learns of it when it fails at run time instead of from the compiler.

#### Examples

```tsx title="Avoid"
type TooltipProps = {
  label: string;
  children: ReactNode;
};

export const Tooltip = ({ label, children }: TooltipProps): ReactElement =>
  cloneElement(children as ReactElement, { 'aria-label': label });
```

```tsx title="Prefer"
type TooltipProps = {
  label: string;
  children: ReactElement<{ 'aria-label'?: string }>;
};

export const Tooltip = ({ label, children }: TooltipProps): ReactElement =>
  cloneElement(children, { 'aria-label': label });
```

### controllable-props-named-after-their-value → stateful-component-controllable-or-not · SHOULD

Every controllable value's props are named after it: the value is `<name>` and its initial value `default<Name>`. Its change callback is the event callback of the value's change, and one component takes the three.

#### Why

A component that names the three its own way is learned apart from the primitive library and the platform's elements around it, which all use these names.

#### Examples

```tsx title="Avoid"
type QuantityPickerProps = {
  current?: number;
  initial?: number;
  onUpdate?: (quantity: number) => void;
};
```

```tsx title="Prefer"
type QuantityPickerProps = {
  quantity?: number;
  defaultQuantity?: number;
  onQuantityChange?: (quantity: number) => void;
};
```

## Modules

### component-module-exports-only-components → file-holds-one-topic · MUST

Every module that exports a component exports only components and their types. A hook, a constant or a context the component shares sits in a module of its own. Exempt: an export the module's framework requires of it, such as a route's settings; and a program no bundler with Fast Refresh serves, such as a terminal program.

#### Why

Fast Refresh keeps a component's state across an edit only in a module whose every export is a component, a type being gone once compiled, and reloads any other module whole, so the screen being worked on loses its state at every save — React's Fast Refresh.

#### Examples

```tsx title="Avoid"
export const useCart = (): Cart => use(CartContext);

export const CartSummary = (): ReactElement => <Total of={useCart()} />;
```

```tsx title="Prefer"
// hooks/use-cart.ts
export const useCart = (): Cart => use(CartContext);

// cart-summary.tsx
export const CartSummary = (): ReactElement => <Total of={useCart()} />;
```
