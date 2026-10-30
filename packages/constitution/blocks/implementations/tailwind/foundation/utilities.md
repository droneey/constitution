# Utilities

> Governs the utilities a class list uses: their tokens, breakpoints, sizes, transitions and merging.

## Tokens

### utilities-only-from-tokens → tokens-single-source-of-appearance · MUST

No arbitrary value of any kind — a colour, a size or any other — is written in a class, save one that assigns a token's variable, with a suppression that says why.

| Why |
|---|
| an arbitrary value is a value outside the tokens, written where no theme and no mode reaches it. |

## Breakpoints and sizes

### mobile-first-breakpoints → breakpoints-add-to-the-smallest-screen · MUST

No class opens with a `max-*:` variant: base classes serve small screens and are widened by `md:`, `lg:` and `xl:`, and a range is bounded after its minimum, as in `md:max-lg:`.

| Why |
|---|
| styles that only widen never undo each other, and the smallest screen is always the base. |

### screen-sized-classes-never-used → viewport-size-in-small-viewport-units · MUST

No class sizes with `h-screen` or `w-screen`.

| Why |
|---|
| `h-screen` is `100vh`, which ignores the browser's own toolbars on phones, and `w-screen` is `100vw`, which overflows beside a scrollbar. |

## Transitions

### transition-all-never-used → transition-names-its-properties · MUST

No class list or `@apply` holds `transition-all`; a transition is a utility that names what it animates, such as `transition-colors` or `transition-transform`.

| Why |
|---|
| `transition-all` animates every property, and the other transition utilities each name theirs. |

## Merging

### class-merger-knows-the-theme · MUST

The class merger is configured with every scale the theme defines — `extendTailwindMerge` given the theme's namespaces — and a spec proves that two classes of different groups both survive a merge.

| Why |
|---|
| with the default scales reset, the merger cannot tell a size from a colour of the theme and silently drops one of them. |
