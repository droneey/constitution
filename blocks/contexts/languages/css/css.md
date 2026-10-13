---
id: css
summary: "Stylesheets: cascade layers, selectors, custom properties and classes."
requires: []
extends: null
abstract: false
languages: []
dictionary: [.css, "@layer", "@property"]
governs: ["**/*.css"]
---

# CSS

> The language of a program's stylesheets, whatever writes their classes: plain stylesheets, scoped ones or a utility library. Cascade layers and selectors decide which rule wins, custom properties carry the values, and classes tie the styles to the markup. What a browser, a user interface, a design system and a reader's direction add lives in the seams.

## Code

### class-declared-is-used → dead-code-deleted · MUST
Every class a stylesheet declares is used by markup, save a class a package offers to other packages through the stylesheet it publishes.

| Why | Tags |
|---|---|
| an unused class is dead code nobody dares delete, since nothing in the stylesheet shows that it styles nothing. | [] |

## Names

### class-name-in-kebab-case → name-case-by-kind · SHOULD
A class the project declares is written in kebab-case: `.order-summary`, `.order-summary-title`.

| Why | Tags |
|---|---|
| one case leaves no class spelled two ways, and a search for a name finds every use of it. | [] |

### class-named-for-what-the-element-is → name-reveals-intent · SHOULD
A class the project declares names what its element is — `.order-summary` — never how it looks: `.red`, `.mt-4`.

| Why | Tags |
|---|---|
| a name that says what an element is stays true when its look changes; one that says how it looks lies after the first redesign. | [] |

## Types

### custom-property-read-where-defined · MUST
A custom property is read only through `var()`, and only where the theme, or a rule that matches the element or one of its ancestors, defines it, or with a fallback written in its `var()`.

| Why | Tags |
|---|---|
| a custom property nothing defines resolves to an invalid value, and the declaration that reads it silently falls back to the inherited or initial value. | [] |

### custom-property-registered-where-typed · MUST
A custom property that is animated or transitioned is registered by `@property` with its syntax, its inheritance and a valid initial value.

| Why | Tags |
|---|---|
| an unregistered property is plain text to the browser: it jumps instead of animating, and a value of the wrong type passes until it breaks the declaration that reads it. | [] |

## Cascade

### style-rule-in-a-named-layer · MUST
Every style rule sits in a named cascade layer: none stays outside a layer, and no layer is anonymous.

| Why | Tags |
|---|---|
| layers decide which rule wins by the order they are declared in, not by specificity or by the file that loaded last, and a rule outside every layer beats them all. | [] |

### layer-order-declared-once · SHOULD
The order of the layers is declared once, at the top of the entry stylesheet, before any layer is filled: `@layer reset, base, components, utilities;`.

| Why | Tags |
|---|---|
| one line then says which styles win over which, and a layer filled before it is declared takes its place in the order by accident. | [] |

### declaration-never-important · MUST
No declaration is `!important`; a rule that must win sits in a later layer. The one exception is the layer that resets the defaults, for a user's preference such as reduced motion and for `[hidden]`, its suppression saying so.

| Why | Tags |
|---|---|
| `!important` reverses the order of the layers and can be beaten only by another `!important`, so every use invites the next. | [] |

## Selectors

### selector-specificity-never-descends · MUST
Within one cascade layer, a selector never follows, in source order, a selector of higher specificity that styles the same element.

| Why | Tags |
|---|---|
| a later selector that loses to an earlier one does nothing, while it reads as the rule that applies. | [] |

### selector-classes-within-the-limit · MUST
A selector holds no more classes than the limit the project sets.

| Why | Tags |
|---|---|
| each class added to a selector ties the style to one more fact of the markup and raises the specificity the next rule has to beat. | [] |

### nested-rule-within-the-depth-limit · SHOULD
A nested style rule sits no deeper than the depth the project sets, counted from the rule outside any nesting.

| Why | Tags |
|---|---|
| each level of nesting is a selector the reader must join in their head and specificity the next rule must beat, and the joined selector appears nowhere a search can find it. | [] |

### selector-never-targets-an-id · MUST
A selector never names an `id`.

| Why | Tags |
|---|---|
| an id selector outweighs every class, so its style can be overridden only by another id, and it styles one element that can never be reused. | [] |

### default-style-has-zero-specificity · SHOULD
A default meant to be overridden — the reset's, the base layer's, a library's — wraps its selectors in `:where()`.

| Why | Tags |
|---|---|
| a default of zero specificity yields to any rule that styles the element, so an override never has to outweigh it, inside its layer or, for a library, in a stylesheet without layers. | [] |
