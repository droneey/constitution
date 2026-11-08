# Components

> Governs how a component's variants and a component primitive's classes are written in Tailwind.

## Variants

### variants-in-one-cva-map → own-variants-one-typed-map · SHOULD

Every component's own variants are one `cva` map, which types its props through `VariantProps`. No enum or union declares a variant's axis again.

| Why |
|---|
| a second declaration of an axis drifts from the map, so the props offer a variant the map no longer styles. |

### cascading-variant-resolved-by-a-tailwind-variant → cascading-variant-by-data-attribute · SHOULD

Every cascading variant is resolved in class lists by a `@custom-variant` or by the `in-data-*` variant.

| Why |
|---|
| a descendant that reads its ancestor's attribute through an arbitrary selector repeats the attribute's spelling in every class list, and the next change of the attribute misses one of them. |

## Primitives

### primitive-class-merged-by-cn → primitive-passes-its-element-through · MUST

Every component primitive merges its class with the caller's through `cn()`, the caller's last.

| Why |
|---|
| classes joined without the merge both stay, so the caller's utility and the primitive's fight by their order in the stylesheet and the caller's may lose; the merge keeps the last of two classes of one group. |
