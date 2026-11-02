# Names

> Governs a name in TypeScript: the case of an identifier, a type parameter's included, the names of types and the spelling of a function's kind.

## Form

### identifier-case-by-kind → name-case-by-kind · SHOULD

Each kind of TypeScript name takes one case. Types, interfaces, classes, enums and enum members are PascalCase, and a type parameter is `T` or `T` followed by its role; a module-level constant initialised by a literal written out — a primitive, a regular expression, a template without expressions, or an object or array literal declared `as const` — is SCREAMING_SNAKE_CASE; a type's companion, the `const` object that holds its functions, takes the type's name; functions, variables, instances, object and type keys, and every other value, one computed from constants included, are camelCase. A name for what a framework renders takes the case that framework's block names.

| Why |
|---|
| where two kinds share a case, a reader takes a type for a value or a computed value for a fixed one until the declaration is read, and a type parameter without its `T` shadows a concrete type of the same name unseen. |

### type-names-undecorated → type-name-undecorated · SHOULD

A type's name, an interface's too, has no `I` prefix and no `Type` or `Interface` suffix.

| Why |
|---|
| an interface and a type alias read alike at every use, so the mark tells its reader nothing, lengthens every use, and turns false the day one becomes the other. |

### function-kinds-spelled-on-the-companion → function-named-for-what-it-does · SHOULD

A parse, a conversion and a derived value are members of their type's companion. A parse and a conversion into a type that has no companion, and a derived value of one, such as an enumeration, are free camelCase functions, and a derived value, as a member reached through its type's companion, is shadowed by no local binding of the same noun.

| Why |
|---|
| a free function beside the type it builds reads as one more helper, and a derived value named by its noun collides with a local binding of that noun; reached through its companion, each reads as what it builds and collides with nothing. |
