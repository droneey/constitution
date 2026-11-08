# Utilities

> Governs the utilities a class list uses and the theme that makes them: their tokens, modes, breakpoints, sizes, sides, transitions and merging.

## Vocabulary

The **class merger** is the `tailwind-merge` instance `cn()` calls, which keeps the last of two classes of one group.

## Tokens

### utilities-only-from-tokens → tokens-single-source-of-appearance · MUST

Every class list writes only utilities of the tokens, never an arbitrary value. That holds for a colour, a size or a value of any other kind. Exempt: an arbitrary value that assigns a token's variable, with a suppression that says why.

| Why |
|---|
| an arbitrary value sits outside the tokens, where no theme and no mode reaches it, so it stays as it was when the theme or the mode changes everything around it — a single source of truth. |

### theme-resets-every-default-scale → tokens-single-source-of-appearance · MUST

One `@theme` block holds `--*: initial`, which resets every default scale at once.

| Why |
|---|
| a default scale left in place makes a utility for a value outside the tokens, which a class then writes by accident. |

### theme-alias-block-written-inline → tokens-single-source-of-appearance · MUST

Every `@theme` block but the reset is `inline`.

| Why |
|---|
| an alias in a block that is not `inline` is resolved where the theme declares it, so a utility keeps that value and stops following a token redefined for a mode. |

## Modes

### dark-variant-follows-the-mode-selector → theme-follows-system-until-chosen · MUST

Every `dark:` class follows the selector that switches the theme mode, through a `@custom-variant dark` declared on that selector.

| Why |
|---|
| a `dark:` class left on `prefers-color-scheme` shows the system's mode after the user chose the other one. |

## Breakpoints and sizes

### class-never-opens-with-a-max-variant → breakpoints-add-to-the-smallest-screen · MUST

No class opens with a `max-*:` variant. A range is bounded after its minimum, as in `md:max-lg:`.

| Why |
|---|
| a class that opens with `max-*:` undoes a base style for the screens below it, so the styles of two ranges fight each other and the smallest screen is no longer the base the others widen. |

### screen-height-class-never-used → viewport-height-leaves-out-the-browsers-toolbars · MUST

No class sizes a height by the large viewport, as `h-screen` and `h-lvh` do, or their `min-` and `max-` forms.

| Why |
|---|
| `h-screen` is `100vh` and `h-lvh` is `100lvh`, and both count the space under a phone browser's toolbars, so content slides beneath them. |

### screen-width-class-never-used → full-width-leaves-out-the-scrollbar · MUST

No class sizes a width by a viewport unit, as `w-screen`, `w-svw`, `w-lvw` and `w-dvw` do, or their `min-` and `max-` forms.

| Why |
|---|
| `w-screen` is `100vw`, and every viewport unit, small, large or dynamic, counts the scrollbar, so the page scrolls sideways. |

## Transitions

### transition-all-never-used → transition-names-its-properties · MUST

No class list or `@apply` holds `transition-all`.

| Why |
|---|
| `transition-all` animates every property that changes, so a change nobody meant to animate is animated, layout ones included, while the other transition utilities each name theirs. |

## Merging

### class-merger-knows-the-theme · MUST

The class merger knows every scale of the theme: `extendTailwindMerge` is given every namespace the theme defines.

| Why |
|---|
| with the default scales reset, the merger cannot tell a size from a colour of the theme and silently drops one of them. |

### class-merger-proven-on-the-theme-by-a-spec · SHOULD

Every class merger has a spec in which two classes of different groups of the theme both survive a merge.

| Why |
|---|
| a namespace the merger was not given shows only when a class goes missing on a screen, which no spec of the screens notices. |

## Direction

### logical-utilities-for-direction → inline-side-written-logically · MUST

Every class list writes logical sides, never physical ones. The physical-side utilities, such as `ml-`, `pr-`, `left-`, `text-left`, `border-l` and `rounded-l`, give way to the logical ones, such as `ms-`, `pe-`, `start-` and `text-start`. Exempt: a class on numbers, media controls and logos, which keep their direction.

| Why |
|---|
| a physical side stays where it is when a language written right to left reverses the line, so the layout breaks there unless a second set of classes undoes it, while a logical side costs nothing in a program whose every language runs left to right. |
