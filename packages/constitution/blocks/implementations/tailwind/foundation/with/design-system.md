# Design system

> Governs how Tailwind resolves the tokens, styles of text and variants of a design system.

## Variants

### variants-in-one-cva-map → own-variants-one-typed-map · MUST

A component's own variants are one `cva` map, which types the props through `VariantProps`. The axis is declared once, never again as an enum or a union; `cn()` merges classes and never decides one.

| Why |
|---|
| a second declaration of an axis drifts from the map, and a class decided outside the map is a variant nobody can find. |

### cascading-variants-in-utilities → cascading-variant-by-data-attribute · MUST

A cascading variant is a `data-*` attribute on the root, resolved by a `@custom-variant` or the `in-data-*` variant, and never passed down as a prop.

| Why |
|---|
| a variant passed down as a prop is threaded through every component between the root and the descendant that reads it, and one that forgets it renders the wrong variant; the stylesheet reaches every descendant at once. |

## Modes

### dark-theme-redefines-tokens → theme-modes-share-one-token-set · MUST

Dark mode redefines the semantic tokens under one selector. A component writes `dark:` only where no token can say it.

| Why |
|---|
| a component that writes its own `dark:` classes holds a second dark palette, which the next change of the theme misses. |

## Primitives

### primitive-class-merged-by-cn → primitive-passes-its-element-through · SHOULD

A primitive merges its class with the caller's through `cn()`, the caller's last.

| Why |
|---|
| classes joined without the merge both stay, so the caller's utility and the primitive's fight by their order in the stylesheet and the caller's may lose; the merge keeps the last of two classes of one group. |

## Tokens

### class-names-only-semantic-colors → component-reads-only-semantic-and-common-tokens · MUST

A class names only semantic and common colours. `@theme` aliases only the semantic and common colour tokens, so no class can name a primitive colour or a palette Tailwind ships.

| Why |
|---|
| a class that names a primitive colour or a shipped palette skips the semantic layer and keeps its colour when the theme or the mode remaps the rest; a utility exists only for what `@theme` aliases, so a primitive left out of it cannot be written in a class. |

### theme-aliases-the-token-properties → custom-property-spells-its-token · MUST

Tailwind's theme aliases the tokens' custom properties, which keep the tokens' names. The properties sit on the root under the tokens' names; each alias of Tailwind's theme sits in Tailwind's own namespace and reads a token's property, and a token whose name already is Tailwind's is named as itself in an `@theme inline reference` block.

| Why |
|---|
| a token renamed for Tailwind has two names, one in its source and one in the browser, and Tailwind reads a token's name in another namespace as its own, as it reads any `--font-*` as a family; an alias of a name Tailwind already reads would read itself, a cycle that voids the value. |

### typography-token-aliased-as-a-text-composite → font-token-is-one-typography-composite · MUST

A typography token reaches Tailwind as its text composite. The composite is `--text-<kind>-<step>` with its `--line-height`, `--letter-spacing` and `--font-weight`, each the alias of the part's own property, so one class, `text-<kind>-<step>`, sets the style of text; its family, which the text composite lacks, is `--font-<kind>`, one alias for each kind of text that reads its styles' family, so a component writes `text-<kind>-<step> font-<kind>`.

| Why |
|---|
| a style of text set part by part takes several classes that must change together, and one of them is missed when the style changes; Tailwind's text composite holds every part of a style but its family, so a style takes one class and its kind's family a second, never a primitive's class. |
