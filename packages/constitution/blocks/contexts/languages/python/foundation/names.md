# Names

> Governs the case of Python's names and its named constants.

## Meaning

### named-constant-annotated-final → literal-with-a-meaning-is-named · SHOULD

A named constant is a module-level UPPER_SNAKE_CASE name annotated `Final`: `MAX_PAGE_SIZE: Final = 100`.

| Why | Tags |
|---|---|
| the case only asks a reader not to rebind the name, while `Final` makes a rebinding fail the type check. | [] |

## Form

### names-cased-as-pep-8 → name-case-by-kind · SHOULD

A class, a type alias, a type parameter and an exception are PascalCase, an exception's name ending in `Error`; a module, a function, a method, a variable and a parameter are snake_case; a module-level constant and an enumeration's member are UPPER_SNAKE_CASE; a name kept to its module or class opens with one underscore.

| Why | Tags |
|---|---|
| every Python reader and library uses these cases, so the case alone tells a class from a function and a constant from a variable before the declaration is read. | [] |
