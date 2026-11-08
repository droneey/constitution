# Components

> Governs the component primitives built from shadcn source: their polymorphism, parts and text.

## General

### polymorphism-through-render · SHOULD

Every component primitive built from shadcn source has one polymorphism, Base UI's `render` prop. A polymorphic render goes through it, and no primitive adds an `as` or `asChild` of its own.

#### Why

A second mechanism gives each component its own way to swap its element, which callers learn one by one and which joins the primitive's behaviour to the element differently each time.

#### Examples

```tsx title="Avoid"
type ButtonProps = ButtonPrimitive.Props & { asChild?: boolean };

export const Button = ({ asChild, className, ...props }: ButtonProps): ReactElement =>
  asChild ? <Slot className={cn(buttonVariants(), className)} {...props} /> : (
    <ButtonPrimitive className={cn(buttonVariants(), className)} {...props} />
  );
```

```tsx title="Prefer"
export const Button = ({ className, ...props }: ButtonPrimitive.Props): ReactElement => (
  <ButtonPrimitive data-slot="button" className={cn(buttonVariants(), className)} {...props} />
);

// src/presentation/screens/cart/cart.tsx
<Button nativeButton={false} render={<a href={cartUrl} />}>{t`View cart`}</Button>
```

### parts-marked-by-data-slot · SHOULD

Every primitive marks itself and each of its parts with `data-slot`, named after the part.

#### Why

A part with no slot is reached by a class written for it or by its place in the markup, which breaks when the markup changes.

#### Examples

```tsx title="Avoid"
export const CardHeader = ({ className, ...props }: ComponentProps<'div'>): ReactElement => (
  <div className={cn('grid gap-stack-sm', className)} {...props} />
);
```

```tsx title="Prefer"
export const CardHeader = ({ className, ...props }: ComponentProps<'div'>): ReactElement => (
  <div data-slot="card-header" className={cn('grid gap-stack-sm', className)} {...props} />
);
```

### shadcn-text-passed-by-props → primitives-take-text-by-props · MUST

All the text shadcn source ships is replaced by a prop when the source arrives. Each string it ships — a screen reader's "Close" among them — is removed on arrival, and the component takes it by a prop.

#### Why

The shipped strings are English and fixed, so a primitive that keeps them speaks one language whatever the program's locale.

#### Examples

```tsx title="Avoid"
<DialogPrimitive.Close data-slot="dialog-close" className="absolute end-inset-sm top-inset-sm">
  <XIcon aria-hidden />
  <span className="sr-only">Close</span>
</DialogPrimitive.Close>
```

```tsx title="Prefer"
<DialogPrimitive.Close data-slot="dialog-close" className="absolute end-inset-sm top-inset-sm">
  <XIcon aria-hidden />
  <span className="sr-only">{closeLabel}</span>
</DialogPrimitive.Close>
```
