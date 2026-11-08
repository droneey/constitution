# Design system

> Governs how Tailwind resolves the tokens, modes and styles of text of a design system.

## Modes

### dark-variant-only-where-no-token-reaches → theme-modes-share-one-token-set · MUST

No component writes a `dark:` class where a token can say it.

| Why |
|---|
| a component that writes its own `dark:` classes holds a second dark palette, which the next change of the theme misses. |

## Tokens

### class-names-only-semantic-colors → component-never-reads-a-primitive-token · MUST

Every class names only semantic and common colours, never a primitive colour or a palette Tailwind ships.

| Why |
|---|
| a class that names a primitive colour or a shipped palette skips the semantic layer and keeps its colour when the theme or the mode remaps the rest; a utility exists only for what `@theme` aliases, so a primitive token left out of it cannot be written in a class. |

### theme-aliases-the-token-properties → custom-property-spells-its-token · MUST

Every alias of Tailwind's theme sits in Tailwind's own namespace and reads its token's custom property, which keeps the token's name.

| Why |
|---|
| a token renamed for Tailwind has two names, one in its source and one in the browser, and Tailwind reads a token's name in another namespace as its own, as it reads any `--font-*` as a family. |

### token-property-declared-on-the-root → tokens-single-source-of-appearance · MUST

Every custom property a theme alias reads is declared on the root.

| Why |
|---|
| under `@theme inline` a utility reads the property where it is used, so outside the subtree that declares it the utility resolves to nothing. |

### tailwind-named-token-declared-by-theme-reference → custom-property-spells-its-token · MUST

Every token whose name already is one Tailwind reads is named as itself in an `@theme inline reference` block.

| Why |
|---|
| an alias of a name Tailwind already reads would read itself, a cycle that voids the value; Tailwind's parser accepts the `reference` option of `@theme` though its documentation lists only `inline` and `static` (tailwindcss, `parseThemeOptions` in `src/index.ts`), so the form is checked again at each major release. |

### typography-token-aliased-as-a-text-composite → font-token-is-one-typography-composite · MUST

Every typography token reaches Tailwind as its text composite. The composite is `--text-<kind>-<step>` with `--text-<kind>-<step>--line-height`, `--text-<kind>-<step>--letter-spacing` and `--text-<kind>-<step>--font-weight`, each the alias of the part's own property, so one class, `text-<kind>-<step>`, sets the style of text.

| Why |
|---|
| a style of text set part by part takes several classes that must change together, and one of them is missed when the style changes. |

### typography-family-aliased-as-a-font-kind → font-token-is-one-typography-composite · MUST

Every kind of text has one `--font-<kind>` alias of its styles' family, which the text composite lacks. A component writes `text-<kind>-<step> font-<kind>`.

| Why |
|---|
| Tailwind's text composite holds every part of a style but its family, so a family written as a primitive token's class keeps its font when the style's token changes. |
