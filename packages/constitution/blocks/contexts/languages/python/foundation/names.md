# Names

> Governs a name in Python: its case, a class's name, a named constant and the spelling of a function's kind.

## Meaning

### named-constant-annotated-final → literal-with-a-meaning-is-named · SHOULD

A named constant is a module-level UPPER_SNAKE_CASE name annotated `Final`.

| Why |
|---|
| the case only asks a reader not to rebind the name, so without `Final` a rebinding passes the type check and changes the constant for every reader of the module. |

## Form

### names-cased-as-pep-8 → name-case-by-kind · SHOULD

Each kind of name takes its PEP 8 case. A class, a type alias, a type parameter and an exception are PascalCase; a module, a function, a method, a variable and a parameter are snake_case; a module-level constant and an enumeration's member are UPPER_SNAKE_CASE; a name kept to its module or class opens with one underscore.

| Why |
|---|
| every Python reader and library follows these cases, so a name cased otherwise is taken for another kind, a class for a function or a constant for a variable, until its declaration is read — PEP 8. |

### class-name-undecorated → type-name-undecorated · SHOULD

A class's name carries no mark of its construct. It has no `I` prefix and no `Protocol`, `Interface`, `ABC` or `Type` suffix, and the name of a `Protocol` or an `ABC` no `Abstract` or `Base` prefix either.

| Why |
|---|
| the mark repeats what the class's bases already show, lengthens the name at every use and turns false when the class stops being a `Protocol` or an `ABC`; the standard library's own, as `Iterable` and `Mapping`, carry none. |

### function-kinds-spelled-on-their-class → function-named-for-what-it-does · SHOULD

A parse, a conversion, a checked constructor and a derived value of a class are spelled on the class. A parse or a conversion into a class is a classmethod of it, and a snake_case module function only where it builds no class; a class that keeps an invariant is its own checked constructor, and a derived value of a class is a property.

| Why |
|---|
| a parse or a conversion kept apart from its class is not found where the standard library's readers look for an alternate constructor, a checked constructor beside the class is skipped by callers of the constructor `__post_init__` already checks, and a derived value written as a method reads as an act; `from` alone is a keyword, so a conversion takes its source after it. |
