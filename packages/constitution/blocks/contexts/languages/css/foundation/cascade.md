# Cascade

> Governs the cascade: its layers, their order, and importance.

## General

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
