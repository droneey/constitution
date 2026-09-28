# Design system

> Where an interface's look comes from: tokens, their grammar and layers, the variants of each component, and motion.

## tokens-single-source-of-appearance · MUST
Every visual value — colour, space, size, type, radius, shadow, motion, layer — comes from a token of the theme module, which also holds the theme's constants and modes. A layout utility that carries no visual value is allowed.
**Why:** a value typed outside the tokens is a second design that the next theme change misses.
**Check:** tool — lint
**Tags:** ux

## token-grammar-and-layers · MUST
Tokens are named `<namespace>.<group>.<role>[.<step>]`, in four layers: primitive, never used by a component; semantic, on closed vocabularies; common, for the shell's constants; composite. A semantic token refers to primitives, never to a raw value.
**Why:** one grammar makes every token's place and purpose readable from its name, and the layers let a theme change primitives without touching components.
**Check:** review
**Tags:** naming, ux

## no-component-named-tokens · MUST
No token is named after a component; a component's look comes from its variants.
**Why:** a token named after one component cannot be shared, and turns the design system into a list of exceptions.
**Check:** review
**Tags:** naming

## light-and-dark-one-token-set · SHOULD
Light and dark are one set of semantic tokens. Their values are derived by rule and recomputed, never picked by eye; a generated token module is marked as generated.
**Why:** one set means a component is written once for both themes, and derived values keep contrast right when a colour changes.
**Check:** review
**Tags:** ux

## variant-axis-declared-once-in-map · MUST
A component's variants are one declarative map from variant to style, in its `.variants` file, which also types the variant props. No style is decided outside it, and no second declaration — such as a parallel enum — repeats an axis.
**Why:** the map is the one place a variant is defined, so adding one cannot miss a copy.
**Check:** review
**Tags:** types, ux

## cascading-variant-set-once-on-ancestor · SHOULD
A variant that restyles descendants is set once on their ancestor and resolved by the styling cascade, never passed down as a prop.
**Why:** a prop drilled for looks couples every component in between to a decision only the ancestor and the leaves care about.
**Check:** review
**Tags:** ux

## motion-from-tokens · SHOULD
Durations and easings are tokens of two kinds, micro and macro; motion driven from code uses the same tokens, so a request for reduced motion switches them all.
**Why:** motion defined in one place feels consistent and can be turned off in one place.
**Check:** review
**Tags:** ux, a11y

## Requirements for implementation

What any styling library must provide.

## ui-styling-restricted-to-tokens · MUST
The library's default scales can be reset, and a value outside the tokens is rejected by a check.
**Why:** without it, the rule that tokens are the only source of appearance cannot be held by a tool.
**Check:** review
**Tags:** ux

## ui-styling-one-set-for-themes · SHOULD
One token set resolves both light and dark.
**Why:** a library that needs a second set per theme doubles every style.
**Check:** review
**Tags:** ux

## ui-styling-container-queries · SHOULD
Styles respond to the size of the container.
**Why:** a component that sizes to its container needs styles that can see it.
**Check:** review
**Tags:** ux

## ui-styling-cascading-variants · SHOULD
An ancestor's state restyles its descendants without props.
**Why:** without it, a cascading variant must be drilled.
**Check:** review
**Tags:** ux

## ui-variant-map-types-props · SHOULD
The variant engine declares the map and derives the types of the variant props from it.
**Why:** the axis is then declared once and the props cannot disagree with it.
**Check:** review
**Tags:** types
