# Names

> Governs a name in TypeScript: the case of an identifier, a type parameter's included, and the names of types.

## Form

### identifier-case-by-kind → name-case-by-kind · SHOULD

Types, interfaces, classes, enums and enum members are PascalCase, and a type parameter is `T` or `T` followed by its role — `TItem`, `TError`; a module-level constant initialised by a literal written out — a primitive, a regular expression, a template without expressions, or an object or array literal declared `as const` — is SCREAMING_SNAKE_CASE; a type's companion, the `const` object that holds its functions, takes the type's name; functions, variables, instances, object and type keys, and every other value, one computed from constants included, are camelCase. A name for what a framework renders takes the case that framework's block names.

| Why |
|---|
| the case tells what kind of thing a name is before its declaration is read, and the `T` keeps a type parameter from shadowing a concrete type of the same name unseen; an enum member stays PascalCase because it is also the literal type a union's discriminant names. |

### type-names-undecorated → type-name-undecorated · SHOULD

A type's name, an interface's too, has no `I` prefix and no `Type` or `Interface` suffix.

| Why |
|---|
| an interface and a type alias read alike at every use, so a mark of which one a name declares tells its reader nothing. |
