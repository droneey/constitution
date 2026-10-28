# Design system

> Governs how Tailwind resolves the tokens, styles of text and variants of a design system.

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

## Tokens

### class-names-only-semantic-colors → component-reads-only-semantic-and-common-tokens · MUST

A class list names a colour only through the design system's semantic and common tokens, never through Tailwind's own palette.

| Why |
|---|
| a palette class reaches past the tokens, so a component that writes one escapes the theme and its modes. |

### theme-aliases-the-token-properties → custom-property-spells-its-token · MUST

The tokens' custom properties keep the tokens' names, on the root; each alias of Tailwind's theme sits in Tailwind's own namespace and reads a token's property, `--text-sm: var(--font-size-sm)`, and a token whose name already is Tailwind's, `--font-weight-bold`, is named as itself in an `@theme inline reference` block.

| Why |
|---|
| a token keeps one name in its source, in every stylesheet and in the browser, while each utility still reads Tailwind's own namespace, and Tailwind never reads a token's name as another namespace's, as it reads any `--font-*` as a family; an alias of a name Tailwind already reads would read itself, a cycle that voids the value. |

### typography-token-aliased-as-a-text-composite → font-token-is-one-typography-composite · MUST

A typography token reaches Tailwind as its text composite: `--text-<kind>-<step>` with its `--line-height`, `--letter-spacing` and `--font-weight`, each the alias of the part's own property, so one class, `text-code-sm`, sets the style of text; its family, which the text composite lacks, is `--font-<kind>`, one alias for each kind of text that reads its styles' family, so a component writes `text-code-sm font-code`.

| Why |
|---|
| Tailwind's text composite holds every part of a style but its family, so a component applies a style of text with one class and its kind's family with a second, never a primitive's class, and never several that must change together. |
