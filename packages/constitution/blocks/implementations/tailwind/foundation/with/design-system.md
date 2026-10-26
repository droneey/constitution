# Design system

> Governs how Tailwind resolves the tokens and variants of a design system.

## General

### variants-in-one-cva-map → own-variants-one-typed-map · MUST

A component's own variants are one `cva` map, which types the props through `VariantProps`. The axis is declared once, never again as an enum or a union; `cn()` merges classes and never decides one.

| Why |
|---|
| a second declaration of an axis drifts from the map, and a class decided outside the map is a variant nobody can find. |

### dark-theme-redefines-tokens → theme-modes-share-one-token-set · MUST

Dark mode redefines the semantic tokens under one selector; a component writes `dark:` only where no token can say it.

| Why |
|---|
| components written against tokens switch theme without a line of their own. |

### cascading-variants-in-utilities → cascading-variant-by-data-attribute · MUST

A cascading variant is a `data-*` attribute on the root, resolved by a `@custom-variant` or the `in-data-*` variant, and never passed down as a prop.

| Why |
|---|
| the stylesheet reaches every descendant at once, with no prop threaded through them. |

### primitive-class-merged-by-cn → primitive-passes-attributes-and-class · SHOULD

A primitive merges its class with the caller's through `cn()`, the caller's last.

| Why |
|---|
| the merge keeps the last of two classes of one group, so the caller's utility replaces the primitive's instead of fighting it by its order in the stylesheet. |

### class-names-only-semantic-colors → component-reads-only-semantic-and-common-tokens · MUST

A class list names a colour only through the design system's semantic and common tokens, never through Tailwind's own palette.

| Why |
|---|
| a palette class reaches past the tokens, so a component that writes one escapes the theme and its modes. |
