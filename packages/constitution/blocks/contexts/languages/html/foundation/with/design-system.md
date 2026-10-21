# Design system

> Governs how a primitive of the kit passes the page its attributes.

## Primitives

### primitive-passes-attributes-and-class → primitive-passes-its-element-through · SHOULD

A primitive passes its HTML element's native attributes and its class through, its own class merged with the caller's.

| Why | Tags |
|---|---|
| a caller then styles and sets attributes on a primitive as it would on the element underneath. | [ux] |
