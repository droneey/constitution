# Tailwind

## utilities-only-from-tokens · MUST
`@theme` defines only the design system's tokens and resets Tailwind's default scales, so a utility exists only for a token. No arbitrary colour or size is written in a class; an arbitrary value that assigns a token's variable stays legal.
**Why:** with the default scales gone, a value outside the tokens cannot be written by accident.
**Check:** review
**Tags:** ux
**Implements:** `tokens-single-source-of-appearance`

## bare-utility-only-without-a-token · SHOULD
A utility with no token behind it — `flex`, `items-center`, `truncate` — is used only where a token would make no sense.
**Why:** every visual value stays a token, and layout plumbing stays plain.
**Check:** review
**Tags:** ux

## cascading-variants-in-utilities · SHOULD
A cascading variant is a `data-*` attribute on the root, resolved by an `@utility` rule, and never passed down as a prop.
**Why:** the stylesheet reaches every descendant at once, with no prop threaded through them.
**Check:** review
**Tags:** design
**Implements:** `cascading-variant-by-data-attribute`

## variants-in-one-cva-map · MUST
A component's own variants are one `cva` map, which types the props through `VariantProps`. The axis is declared once, never again as an enum or a union; `cn()` merges classes and never decides one.
**Why:** a second declaration of an axis drifts from the map, and a class decided outside the map is a variant nobody can find.
**Check:** review
**Tags:** types
**Implements:** `variant-axis-declared-once-in-map`

## mobile-first-breakpoints · MUST
Base classes serve small screens and are widened by `md:`, `lg:` and `xl:`; `max-*:` is forbidden.
**Why:** styles that only widen never undo each other, and the smallest screen is always the base.
**Check:** tool — lint
**Tags:** ux
**Implements:** `mobile-first-additive-breakpoints`

## dynamic-viewport-classes · MUST
Viewport heights use the dynamic units (`h-dvh`), never `h-screen`.
**Why:** `h-screen` is `100vh`, which ignores the browser's own toolbars on phones.
**Check:** tool — lint
**Tags:** ux
**Implements:** `dynamic-viewport-units`

## dark-theme-redefines-tokens · SHOULD
Dark mode redefines the semantic tokens under one selector; a component writes `dark:` only where no token can say it.
**Why:** components written against tokens switch theme without a line of their own.
**Check:** review
**Tags:** ux
**Implements:** `light-and-dark-one-token-set`
