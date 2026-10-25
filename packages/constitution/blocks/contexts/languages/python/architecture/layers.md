# Layers

> Governs the imports made only for the type checker.

## Direction

### type-checking-import-held-to-the-layers → import-points-inward · MUST

An import inside `if TYPE_CHECKING:` is held to the layer matrix like any other.

| Why |
|---|
| a type a layer names is a dependency whether or not it loads at run time, and the layer changes when that type does. |
