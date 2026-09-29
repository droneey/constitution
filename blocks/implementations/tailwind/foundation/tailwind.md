# Tailwind

## utilities-only-from-tokens → tokens-single-source-of-appearance
`@theme` defines only the design system's tokens and resets Tailwind's default scales, so a utility exists only for a token. No arbitrary colour or size is written in a class; an arbitrary value that assigns a token's variable stays legal.

| Why | Check | Tags |
|---|---|---|
| with the default scales gone, a value outside the tokens cannot be written by accident. | review | [] |

## bare-utility-only-without-a-token · SHOULD
A utility with no token behind it — `flex`, `items-center`, `truncate` — is used only where a token would make no sense.

| Why | Check | Tags |
|---|---|---|
| every visual value stays a token, and layout plumbing stays plain. | review | [ux] |

## cascading-variants-in-utilities → cascading-variant-by-data-attribute
A cascading variant is a `data-*` attribute on the root, resolved by an `@utility` rule, and never passed down as a prop.

| Why | Check | Tags |
|---|---|---|
| the stylesheet reaches every descendant at once, with no prop threaded through them. | review | [] |

## variants-in-one-cva-map → variant-axis-declared-once-in-map
A component's own variants are one `cva` map, which types the props through `VariantProps`. The axis is declared once, never again as an enum or a union; `cn()` merges classes and never decides one.

| Why | Check | Tags |
|---|---|---|
| a second declaration of an axis drifts from the map, and a class decided outside the map is a variant nobody can find. | review | [] |

## mobile-first-breakpoints → mobile-first-additive-breakpoints · MUST
Base classes serve small screens and are widened by `md:`, `lg:` and `xl:`; `max-*:` is forbidden.

| Why | Check | Tags |
|---|---|---|
| styles that only widen never undo each other, and the smallest screen is always the base. | tool/lint | [] |

## dynamic-viewport-classes → dynamic-viewport-units
Viewport heights use the dynamic units (`h-dvh`), never `h-screen`.

| Why | Check | Tags |
|---|---|---|
| `h-screen` is `100vh`, which ignores the browser's own toolbars on phones. | tool/lint | [] |

## dark-theme-redefines-tokens → light-and-dark-one-token-set
Dark mode redefines the semantic tokens under one selector; a component writes `dark:` only where no token can say it.

| Why | Check | Tags |
|---|---|---|
| components written against tokens switch theme without a line of their own. | review | [] |
