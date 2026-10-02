# Design system

> Where a user interface's look comes from: tokens, their grammar and layers, the variants of each component, and motion.

## tokens-single-source-of-appearance · MUST
Every visual value — colour, space, size, type, radius, shadow, motion, layer — comes from a token of the theme module, which also holds the theme's constants and modes. A layout utility that carries no visual value is allowed.

| Why | Check | Tags |
|---|---|---|
| a value typed outside the tokens is a second design that the next theme change misses. | review | [ux] |

## token-grammar-and-layers · MUST
Tokens are named `<namespace>.<group>.<role>[.<step>]`, in four layers: primitive, never used by a component; semantic, on closed vocabularies; common, for the shell's constants; composite. A semantic token refers to primitives, never to a raw value.

| Why | Check | Tags |
|---|---|---|
| one grammar makes every token's place and purpose readable from its name, and the layers let a theme change primitives without touching components. | review | [ux] |

## no-component-named-tokens · MUST
No token is named after a component; a component's look comes from its variants.

| Why | Check | Tags |
|---|---|---|
| a token named after one component cannot be shared, and turns the design system into a list of exceptions. | review | [] |

## light-and-dark-one-token-set · SHOULD
Light and dark are one set of semantic tokens. Their values are derived by rule and recomputed, never picked by eye; a generated token module is marked as generated.

| Why | Check | Tags |
|---|---|---|
| one set means a component is written once for both themes, and derived values keep contrast right when a colour changes. | review | [ux] |

## variant-axis-declared-once-in-map · MUST
A component's variants are one declarative map from variant to style, in a file of its own beside the component, which also types the variant props. No style is decided outside it, and no second declaration — such as a parallel enum — repeats an axis.

| Why | Check | Tags |
|---|---|---|
| the map is the one place a variant is defined, so adding one cannot miss a copy. | review | [ux] |

## cascading-variant-set-once-on-ancestor · SHOULD
A variant that restyles descendants is set once on their ancestor and resolved by the styling cascade, never passed down as a prop.

| Why | Check | Tags |
|---|---|---|
| a prop drilled for looks couples every component in between to a decision only the ancestor and the leaves care about. | review | [ux] |

## motion-from-tokens · SHOULD
Durations and easings are tokens of two kinds, micro and macro; motion driven from code uses the same tokens, so a request for reduced motion switches them all.

| Why | Check | Tags |
|---|---|---|
| motion defined in one place feels consistent and can be turned off in one place. | review | [ux, a11y] |

## theme-follows-system-until-chosen → light-and-dark-one-token-set
The theme follows the system's preference until the user chooses one; the choice persists and is applied before the first paint.

| Why | Check | Tags |
|---|---|---|
| a theme applied after the first paint flashes the wrong one, and a choice lost on reload is a choice the user makes every visit. | review | [ux] |

## tokens-kept-in-the-interchange-format → tokens-single-source-of-appearance
Where a design tool or a second platform reads the tokens, their source is the design-token interchange format, and every output is generated from it.

| Why | Check | Tags |
|---|---|---|
| one source the design tool and every platform read keeps them the same; a project with one product and one platform may keep its tokens in the theme module alone. | review | [ux] |
## Requirements for implementation

What any styling library must provide.

## ui-styling-restricted-to-tokens · MUST
The library's default scales can be reset, and a value outside the tokens is rejected by a check.

| Why | Check | Tags |
|---|---|---|
| without it, the rule that tokens are the only source of appearance cannot be held by a tool. | review | [ux] |

## ui-styling-one-set-for-themes · SHOULD
One token set resolves both light and dark.

| Why | Check | Tags |
|---|---|---|
| a library that needs a second set per theme doubles every style. | review | [ux] |

## ui-styling-container-queries · SHOULD
Styles respond to the size of the container.

| Why | Check | Tags |
|---|---|---|
| a component that sizes to its container needs styles that can see it. | review | [ux] |

## ui-styling-cascading-variants · SHOULD
An ancestor's state restyles its descendants without props.

| Why | Check | Tags |
|---|---|---|
| without it, a cascading variant must be drilled. | review | [ux] |

## ui-variant-map-types-props · SHOULD
The variant engine declares the map and derives the types of the variant props from it.

| Why | Check | Tags |
|---|---|---|
| the axis is then declared once and the props cannot disagree with it. | review | [] |
