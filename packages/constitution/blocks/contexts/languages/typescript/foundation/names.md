# Names

> Governs the case of identifiers and the names of types and type parameters.

## Form

### identifier-case-by-kind → name-case-by-kind · SHOULD

Types, classes, enums and enum members are PascalCase; functions, variables and instances camelCase; a module-level constant holding a primitive or a regular expression SCREAMING_SNAKE_CASE, and one holding an object, an array or a function camelCase. A function a framework renders by the case of its name takes the case that framework's block names.

| Why | Tags |
|---|---|
| the case tells what kind of thing a name is before its declaration is read. | [] |

### type-names-undecorated · SHOULD

A type's name is a noun with no decoration: no `I` prefix, on interfaces too, and no `Type` or `Interface` suffix.

| Why | Tags |
|---|---|
| a decoration repeats what the language already shows and makes every name longer. | [] |

### type-parameter-starts-with-t · SHOULD

A type parameter is `T`, or a name that starts with `T` and says its role: `TItem`, `TError`.

| Why | Tags |
|---|---|
| the prefix tells a type parameter from a concrete type at every use, and the rest of the name says which is which where there are several. | [] |
