# Selectors

> Governs selectors: their specificity, their classes, their nesting and what they target.

## General

### selector-specificity-never-descends · MUST

Within one cascade layer, a selector never follows, in source order, a selector of higher specificity that styles the same element.

| Why |
|---|
| a later selector that loses to an earlier one does nothing, while it reads as the rule that applies. |

### selector-classes-within-the-limit · MUST

A selector holds no more classes than the limit the project sets.

| Why |
|---|
| a selector of many classes stops matching when any one of the markup facts it ties to changes, and its specificity is one every later rule for the element must beat. |

### nested-rule-within-the-depth-limit · SHOULD

A nested style rule sits no deeper than the depth the project sets, counted from the rule outside any nesting.

| Why |
|---|
| each level of nesting is a selector the reader must join in their head and specificity the next rule must beat, and the joined selector appears nowhere a search can find it. |

### selector-never-targets-an-id · MUST

A selector never names an `id`.

| Why |
|---|
| an id selector outweighs every class, so its style can be overridden only by another id, and it styles one element that can never be reused. |

### default-style-has-zero-specificity · SHOULD

A default meant to be overridden has zero specificity. The reset's, the base layer's or a library's default wraps its selectors in `:where()`.

| Why |
|---|
| a default with a specificity of its own must be outweighed by every rule that overrides it, so overrides grow their selectors or reach for `!important`, inside its layer or, for a library, in a stylesheet without layers. |
