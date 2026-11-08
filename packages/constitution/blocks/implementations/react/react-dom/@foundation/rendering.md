# Rendering

> Governs what a component renders and reads — overlays, browser globals, inline styles and raw markup — where its render errors go, and who writes the document's head.

## Overlays

### overlay-never-clipped-by-an-ancestor · MUST

No overlay is clipped by an ancestor's overflow or stacking context. A dialog, a popover or a toast renders through a portal or in the top layer, the layer the platform gives a modal `<dialog>` and a `popover`.

#### Why

An overlay rendered inside its parent is cut off by the parent's overflow or hidden under a sibling's stacking context, and focus management breaks around it.

#### Examples

```tsx title="Avoid"
<div className="relative overflow-hidden rounded-lg">
  <OrderRow order={order} />
  {isConfirming && (
    <div role="dialog" className="absolute inset-0">
      <ConfirmCancel order={order} />
    </div>
  )}
</div>
```

```tsx title="Prefer"
<div className="relative overflow-hidden rounded-lg">
  <OrderRow order={order} />
  <Dialog.Root open={isConfirming} onOpenChange={setIsConfirming}>
    <Dialog.Portal>
      <Dialog.Popup>
        <ConfirmCancel order={order} />
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
</div>
```

## Browser globals

### browser-global-read-by-effect-or-external-store → browser-global-never-read-while-rendering · MUST

Every browser global a component renders from is read in a hook's effect or through `useSyncExternalStore` with a server snapshot.

#### Why

Read during render, a global breaks server rendering and tears between renders, while an effect reads it once the component is in the tab and an external store with a server snapshot gives the server a value of its own.

#### Examples

```tsx title="Avoid"
export const CheckoutLayout = ({ children }: CheckoutLayoutProps): ReactElement =>
  window.innerWidth < 640 ? (
    <StackedLayout>{children}</StackedLayout>
  ) : (
    <SplitLayout>{children}</SplitLayout>
  );
```

```tsx title="Prefer"
const narrowQuery = '(max-width: 639px)';

const subscribe = (onChange: () => void): (() => void) => {
  const query = window.matchMedia(narrowQuery);

  query.addEventListener('change', onChange);

  return () => query.removeEventListener('change', onChange);
};

export const useIsNarrow = (): boolean =>
  useSyncExternalStore(subscribe, () => window.matchMedia(narrowQuery).matches, () => false);
```

## Styles and markup

### inline-style-holds-only-custom-properties → tokens-single-source-of-appearance · MUST

Every element's inline `style` holds only custom properties, as an object literal. Exempt: geometry a positioning library computes, under a suppression that says so.

#### Why

An inline visual value sits outside the tokens, where no theme and no mode reaches it, while a custom property only passes data to the styles that use it.

#### Examples

```tsx title="Avoid"
<div style={{ width: `${progress * 100}%`, backgroundColor: '#16a34a' }} />
```

```tsx title="Prefer"
<div className="w-(--progress) bg-success" style={{ '--progress': `${progress * 100}%` }} />
```

### dangerously-set-inner-html-never-used → raw-html-never-reaches-the-dom · MUST

`dangerouslySetInnerHTML` is never set.

#### Why

It writes a string into the DOM as markup, past React's escaping, so a script hidden in the string runs in the user's page.

#### Examples

```tsx title="Avoid"
<div dangerouslySetInnerHTML={{ __html: product.description }} />
```

```tsx title="Prefer"
<Markdown>{product.description}</Markdown>
```

## Render errors

### render-errors-reported-at-the-root → last-resort-handler-one-per-interface · MUST

Every render error reaches the root's handlers, and only them. The root's `onUncaughtError`, `onCaughtError` and `onRecoverableError` take each, and a boundary renders the failure and reports nothing itself.

#### Why

A boundary that also reports makes one render error look like two, and one it misses goes unreported; the root sees every render error, the ones a boundary catches included.

#### Examples

```tsx title="Avoid"
export class ScreenBoundary extends Component<ScreenBoundaryProps, ScreenBoundaryState> {
  state: ScreenBoundaryState = { hasFailed: false };

  static getDerivedStateFromError(): ScreenBoundaryState {
    return { hasFailed: true };
  }

  componentDidCatch(error: Error): void {
    errorReporter.report(error);
  }

  render(): ReactNode {
    return this.state.hasFailed ? <ScreenFailure /> : this.props.children;
  }
}
```

```tsx title="Prefer"
// src/main.tsx
createRoot(container, {
  onUncaughtError: (error, info) => errorReporter.report(error, info),
  onCaughtError: (error, info) => errorReporter.report(error, info),
  onRecoverableError: (error, info) => errorReporter.report(error, info),
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

## Head

### head-written-by-hoisted-elements → browser-resources-have-one-writer · MUST

Wherever no other active block gives the document's head another writer, `<title>`, `<meta>` and `<link>` reach it only as elements React hoists. Neither a library that writes the head itself nor an effect writes to it.

#### Why

A library or an effect is a second writer of the head, and it and React overwrite each other on every render.

#### Examples

```tsx title="Avoid"
export const ProductScreen = ({ product }: ProductScreenProps): ReactElement => {
  useEffect(() => {
    document.title = product.name;
  }, [product.name]);

  return <ProductDetails product={product} />;
};
```

```tsx title="Prefer"
export const ProductScreen = ({ product }: ProductScreenProps): ReactElement => (
  <>
    <title>{product.name}</title>
    <meta name="description" content={product.summary} />
    <ProductDetails product={product} />
  </>
);
```
