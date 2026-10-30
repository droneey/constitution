# Names

> Governs a name in TypeScript: the case of an identifier and the names of types, error types and type parameters.

## Form

### identifier-case-by-kind → name-case-by-kind · SHOULD

Types, interfaces, classes, enums and enum members are PascalCase; a module-level constant initialised by a literal written out — a primitive, a regular expression, a template without expressions, or an object or array literal declared `as const` — SCREAMING_SNAKE_CASE; a type's companion, the `const` object that holds its functions, takes the type's name; functions, variables, instances, object and type keys, and every other value, one computed from constants included, camelCase. A name for what a framework renders takes the case that framework's block names.

| Why |
|---|
| the case tells what kind of thing a name is before its declaration is read; an enum member stays PascalCase, unlike Google's CONSTANT_CASE, because it is also the literal type a union's discriminant names. |

### type-names-undecorated · SHOULD

A type's name is a noun with no decoration: no `I` prefix, on interfaces too, and no `Type` or `Interface` suffix.

| Why |
|---|
| a decoration repeats what the language already shows and makes every name longer. |

### error-class-name-ends-in-error → error-name-ends-in-error · MUST

A class of error the program throws ends its name in `Error`: `OrderNotFoundError`, never `OrderNotFound` or `OrderNotFoundException`.

| Why |
|---|
| the language's own `TypeError` and `RangeError` end an error's name so, and a project's errors then read like the ones every reader knows. |

### type-parameter-starts-with-t · SHOULD

A type parameter is `T`, or a name that starts with `T` and says its role: `TItem`, `TError`.

| Why |
|---|
| the prefix tells a type parameter from a concrete type at every use, and the rest of the name says which is which where there are several. |
