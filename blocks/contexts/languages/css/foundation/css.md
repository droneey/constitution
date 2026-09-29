# CSS

## Cascade

## styles-in-named-layers · MUST
Every style rule sits in a named cascade layer: none is left outside a layer, and no layer is anonymous.

| Why | Check | Tags |
|---|---|---|
| layers decide which rule wins by the order they are declared in, not by specificity or by the file that loaded last, so a reset or a library never overrides a component by accident. | tool/lint | [] |

## layer-order-declared-once · SHOULD
The order of the layers is declared once, at the top of the entry stylesheet, before any layer is filled: `@layer reset, base, components, utilities;`.

| Why | Check | Tags |
|---|---|---|
| one line then says which styles win over which, and a layer filled before it is declared would take its place in the order by accident. | review | [] |

## no-important-declarations · MUST
No declaration is `!important`; a rule that must win sits in a later layer.

| Why | Check | Tags |
|---|---|---|
| `!important` reverses the order of the layers and can only be beaten by another `!important`. | tool/lint | [] |

## selectors-stay-shallow · MUST
A selector holds at most three classes, and a selector of lower specificity never comes after one of higher specificity for the same element.

| Why | Check | Tags |
|---|---|---|
| a deep selector ties a style to one place in the markup, and a later selector that loses to an earlier one does nothing while it reads as the rule that applies. | tool/lint | [] |

## styles-never-target-ids · MUST
An element is styled by a class or an attribute, never by its `id`.

| Why | Check | Tags |
|---|---|---|
| an id selector outweighs every class, so the style can only be overridden by another id, and it styles one element that can never be reused. | tool/lint | [] |

## Values

## custom-properties-declared-before-use · MUST
A custom property is declared before it is read, and read through `var()`; one that is animated or must hold one type is registered with `@property`, with a valid initial value.

| Why | Check | Tags |
|---|---|---|
| an undeclared property resolves to nothing and the declaration silently falls back, and an unregistered one can neither be animated nor checked. | review | [] |

## custom-properties-declared-and-read-by-var → custom-properties-declared-before-use
A custom property is declared before it is read and read through `var()`, and a registered one has a valid initial value.

| Why | Check | Tags |
|---|---|---|
| an undeclared property resolves to nothing, silently. | tool/lint | [] |

## baseline-features-only · SHOULD
A stylesheet uses only features that are Baseline widely available.

| Why | Check | Tags |
|---|---|---|
| a feature every current browser has behaves the same for every user; one that is not yet everywhere breaks silently where it is missing. | tool/lint | [ux] |

## Classes and layout

## classes-declared-and-used · MUST
Every class a stylesheet declares is used in markup, and every class markup uses is declared, by a stylesheet or by the styling library.

| Why | Check | Tags |
|---|---|---|
| an unused class is dead code nobody dares delete, and an undeclared one is a typo that styles nothing. | review | [] |

## stylesheet-classes-declared-and-used → classes-declared-and-used
Every class a stylesheet declares is used in markup; where no styling library supplies classes, every class markup uses is declared by a stylesheet.

| Why | Check | Tags |
|---|---|---|
| an unused class is dead code, and an undeclared one is a typo that styles nothing. | tool/lint | [] |

## classes-named-for-what-they-are · SHOULD
A class the project declares is kebab-case and names what the element is — `.order-summary`, `.order-summary-title` — never how it looks: `.red`, `.mt-4`.

| Why | Check | Tags |
|---|---|---|
| a name that says what an element is stays true when its look changes; one that says how it looks lies after the first redesign. | review | [] |

## components-adapt-by-container-queries · SHOULD
A component adapts to the space its container gives it with a container query; a media query adapts the page's layout and follows the user's preferences.

| Why | Check | Tags |
|---|---|---|
| a component placed in a sidebar and in the main column then fits both, while the viewport says nothing about the space it was given. | review | [ux] |

## global-styles-only-in-the-entry · SHOULD
Only the entry stylesheet and the theme it imports style elements and the document globally; every other stylesheet is scoped to one component.

| Why | Check | Tags |
|---|---|---|
| a global rule in a component's stylesheet reaches every screen and changes whenever that component is loaded. | review | [] |
