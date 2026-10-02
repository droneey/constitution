# Tailwind

## utilities-only-from-tokens → tokens-single-source-of-appearance
`@theme` defines only the design system's tokens and resets Tailwind's default scales, so a utility exists only for a token. No arbitrary colour or size is written in a class; an arbitrary value that assigns a token's variable stays legal.

| Why | Check | Tags |
|---|---|---|
| with the default scales gone, a value outside the tokens cannot be written by accident. | review | [] |

## no-arbitrary-utility-value → utilities-only-from-tokens
A class carries no arbitrary value; one that assigns a token's variable carries a suppression that states why.

| Why | Check | Tags |
|---|---|---|
| an arbitrary value is a visual value written outside the tokens. | tool/lint | [ux] |

## bare-utility-only-without-a-token · SHOULD
A utility with no token behind it — `flex`, `items-center`, `truncate` — is used only where a token would make no sense.

| Why | Check | Tags |
|---|---|---|
| every visual value stays a token, and layout plumbing stays plain. | review | [ux] |

## cascading-variants-in-utilities → cascading-variant-by-data-attribute
A cascading variant is a `data-*` attribute on the root, resolved by a `@custom-variant` or the `in-data-*` variant, and never passed down as a prop.

| Why | Check | Tags |
|---|---|---|
| the stylesheet reaches every descendant at once, with no prop threaded through them. | review | [] |

## variants-in-one-cva-map → variant-axis-declared-once-in-map
A component's own variants are one `cva` map, which types the props through `VariantProps`. The axis is declared once, never again as an enum or a union; `cn()` merges classes and never decides one.

| Why | Check | Tags |
|---|---|---|
| a second declaration of an axis drifts from the map, and a class decided outside the map is a variant nobody can find. | review | [] |

## mobile-first-breakpoints → mobile-first-additive-breakpoints · MUST
No class opens with a `max-*:` variant: base classes serve small screens and are widened by `md:`, `lg:` and `xl:`, and a range is bounded after its minimum, as in `md:max-lg:`.

| Why | Check | Tags |
|---|---|---|
| styles that only widen never undo each other, and the smallest screen is always the base. | tool/lint | [] |

## dynamic-viewport-classes → dynamic-viewport-units
No class sizes with `h-screen` or `w-screen`.

| Why | Check | Tags |
|---|---|---|
| `h-screen` is `100vh`, which ignores the browser's own toolbars on phones, and `w-screen` is `100vw`, which overflows beside a scrollbar. | tool/lint | [] |

## dark-theme-redefines-tokens → light-and-dark-one-token-set
Dark mode redefines the semantic tokens under one selector; a component writes `dark:` only where no token can say it.

| Why | Check | Tags |
|---|---|---|
| components written against tokens switch theme without a line of their own. | review | [] |

## class-merger-knows-the-theme → utilities-only-from-tokens · MUST
The class merger is configured with every scale the theme defines, and a spec proves that two classes of different groups both survive a merge.

| Why | Check | Tags |
|---|---|---|
| with the default scales reset, the merger cannot tell a size from a colour of the theme and silently drops one of them. | test | [ux] |

## tailwind-layers-are-the-order → layer-order-declared-once
The order of the layers is Tailwind's — `theme, base, components, utilities` — with the project's layers named among them. Tailwind is imported layer by layer (`@import "tailwindcss/theme.css" layer(theme)` and the rest), and any other stylesheet from outside into a layer of its own.

| Why | Check | Tags |
|---|---|---|
| Tailwind declares its layers itself; a second order would fight it. | review | [] |
