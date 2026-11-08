# Components

> Governs how a component's variants and a component primitive's classes are written in Tailwind.

## Variants

### variants-in-one-cva-map → own-variants-one-typed-map · SHOULD

Every component's own variants are one `cva` map, which types its props through `VariantProps`. No enum or union declares a variant's axis again.

#### Why

A second declaration of an axis drifts from the map, so the props offer a variant the map no longer styles.

#### Examples

```tsx title="Avoid"
type BadgeTone = 'neutral' | 'success' | 'danger';

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-on-surface',
  success: 'bg-success text-on-success',
  danger: 'bg-danger text-on-danger',
};
```

```tsx title="Prefer"
const badgeVariants = cva('inline-flex rounded-full px-inset-sm text-label-sm', {
  variants: {
    tone: {
      neutral: 'bg-surface-muted text-on-surface',
      success: 'bg-success text-on-success',
      danger: 'bg-danger text-on-danger',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;
```

### cascading-variant-resolved-by-a-tailwind-variant → cascading-variant-by-data-attribute · SHOULD

Every cascading variant is resolved in class lists by a `@custom-variant` or by the `in-data-*` variant.

#### Why

A descendant that reads its ancestor's attribute through an arbitrary selector repeats the attribute's spelling in every class list, and the next change of the attribute misses one of them.

#### Examples

```tsx title="Avoid"
<Card data-density={density}>
  <CardTitle className="text-title-md [[data-density=compact]_&]:text-title-sm" />
</Card>
```

```tsx title="Prefer"
<Card data-density={density}>
  <CardTitle className="text-title-md in-data-[density=compact]:text-title-sm" />
</Card>
```

## Primitives

### primitive-class-merged-by-cn → primitive-passes-its-element-through · MUST

Every component primitive merges its class with the caller's through `cn()`, the caller's last.

#### Why

Classes joined without the merge both stay, so the caller's utility and the primitive's fight by their order in the stylesheet and the caller's may lose; the merge keeps the last of two classes of one group.

#### Examples

```tsx title="Avoid"
export const Card = ({ className, ...props }: ComponentProps<'div'>): ReactElement => (
  <div className={`${className} rounded-lg bg-surface p-inset-md`} {...props} />
);
```

```tsx title="Prefer"
export const Card = ({ className, ...props }: ComponentProps<'div'>): ReactElement => (
  <div className={cn('rounded-lg bg-surface p-inset-md', className)} {...props} />
);
```
