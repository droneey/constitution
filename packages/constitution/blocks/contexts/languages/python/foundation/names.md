# Names

> Governs a name in Python: its case, an exception's ending and a named constant.

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

### exception-name-ends-in-error → error-name-ends-in-error · MUST

An exception class the program raises for a failure ends its name in `Error`: `OrderNotFoundError`, never `OrderNotFound` or `OrderNotFoundException`.

| Why |
|---|
| PEP 8 and the standard library's own `ValueError` and `KeyError` end an error's name so, and a project's errors then read like the ones every reader knows. |
