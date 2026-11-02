# Utilities

> Governs the utilities a class list uses: their tokens, breakpoints, sizes, transitions and merging.

## Tokens

### utilities-only-from-tokens → tokens-single-source-of-appearance · MUST

A utility exists only for a token, and a class writes no arbitrary value. That holds for a colour, a size or a value of any other kind, save one that assigns a token's variable, with a suppression that says why. One `@theme` block holds `--*: initial`, which resets every default scale at once, and every other `@theme` block is `inline` and holds only aliases of the tokens' custom properties.

| Why |
|---|
| a default scale left in place lets a value outside the tokens be written by accident, an alias that is not `inline` stops following the mode, and an arbitrary value sits outside the tokens, where no theme and no mode reaches it, so it stays as it was when the theme or the mode changes everything around it — a single source of truth. |

## Breakpoints and sizes

### mobile-first-breakpoints → breakpoints-add-to-the-smallest-screen · MUST

No class opens with a `max-*:` variant. Base classes serve small screens and are widened by `md:`, `lg:` and `xl:`, and a range is bounded after its minimum, as in `md:max-lg:`.

| Why |
|---|
| a class that opens with `max-*:` undoes a base style for the screens below it, so the styles of two ranges fight each other and the smallest screen is no longer the base the others widen. |

### screen-sized-classes-never-used → viewport-size-leaves-out-what-the-browser-draws · MUST

No class sizes with `h-screen` or `w-screen`.

| Why |
|---|
| `h-screen` is `100vh`, which ignores the browser's own toolbars on phones, and `w-screen` is `100vw`, which overflows beside a scrollbar. |

## Transitions

### transition-all-never-used → transition-names-its-properties · MUST

No class list or `@apply` holds `transition-all`. A transition is a utility that names what it animates, such as `transition-colors` or `transition-transform`.

| Why |
|---|
| `transition-all` animates every property that changes, so a change nobody meant to animate is animated, layout ones included, while the other transition utilities each name theirs. |

## Merging

### class-merger-knows-the-theme · MUST

The class merger knows every scale of the theme. It is configured with every scale the theme defines — `extendTailwindMerge` given the theme's namespaces — and a spec proves that two classes of different groups both survive a merge.

| Why |
|---|
| with the default scales reset, the merger cannot tell a size from a colour of the theme and silently drops one of them. |
