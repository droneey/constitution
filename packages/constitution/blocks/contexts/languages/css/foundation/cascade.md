# Cascade

> Governs the cascade: its layers, their order, and importance.

## General

### style-rule-in-a-named-layer · MUST

Every style rule sits in a named cascade layer. No rule stays outside a layer, and no layer is anonymous.

| Why |
|---|
| layers decide which rule wins by the order they are declared in, not by specificity or by the file that loaded last, so a rule outside every layer beats them all, and an anonymous layer cannot be named where the order is declared. |

### layer-order-declared-once · SHOULD

The order of the layers is declared once, at the top of the entry stylesheet, before any layer is filled.

| Why |
|---|
| a layer filled before the order is declared takes its place in it by accident, and an order spread over several files says nowhere which styles win over which. |

### declaration-never-important · MUST

No declaration is `!important`. A rule that must win sits in a later layer; the one exception is the layer that resets the defaults, for a user's preference such as reduced motion and for `[hidden]`, its suppression saying so.

| Why |
|---|
| `!important` reverses the order of the layers and can be beaten only by another `!important`, so every use invites the next. |
