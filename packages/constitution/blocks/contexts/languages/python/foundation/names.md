# Names

> Governs a name in Python: its case, a class's name and a named constant.

## Meaning

### named-constant-annotated-final → literal-with-a-meaning-is-named · SHOULD

A named constant is a module-level UPPER_SNAKE_CASE name annotated `Final`: `MAX_PAGE_SIZE: Final = 100`.

| Why |
|---|
| the case only asks a reader not to rebind the name, while `Final` makes a rebinding fail the type check. |

## Form

### names-cased-as-pep-8 → name-case-by-kind · SHOULD

A class, a type alias, a type parameter and an exception are PascalCase; a module, a function, a method, a variable and a parameter are snake_case; a module-level constant and an enumeration's member are UPPER_SNAKE_CASE; a name kept to its module or class opens with one underscore.

| Why |
|---|
| every Python reader and library uses these cases, so the case alone tells a class from a function and a constant from a variable before the declaration is read. |

### class-name-undecorated → type-name-undecorated · SHOULD

A class's name has no `I` prefix and no `Protocol`, `Interface`, `ABC` or `Type` suffix, and the name of a `Protocol` or an `ABC` no `Abstract` or `Base` prefix either.

| Why |
|---|
| a class's bases already show that it is a `Protocol` or an `ABC`, as the standard library's `Iterable` and `Mapping` show it. |
