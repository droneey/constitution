# Names

> Governs a name in Python: its case, the mark of a name kept to its module, a class's name, a named constant and the spelling of a function's kind.

## Meaning

### named-constant-annotated-final · SHOULD

Every named constant is annotated `Final`.

| Why |
|---|
| the case only asks a reader not to rebind the name, so without `Final` a rebinding passes the type check and changes the constant for every reader of the module. |

## Form

### names-cased-as-pep-8 → name-case-by-kind · MUST

Each kind of name takes its PEP 8 case. A class, a type alias, a type parameter and an exception are PascalCase; a function, a method, a variable and a parameter are snake_case; and a module-level constant and an enumeration's member are UPPER_SNAKE_CASE.

| Why |
|---|
| every Python reader and library follows these cases, so a name cased otherwise is taken for another kind, a class for a function or a constant for a variable, until its declaration is read — PEP 8. |

### internal-name-opens-with-one-underscore · SHOULD

Every name kept to its module or its class opens with a single underscore.

| Why |
|---|
| a leading underscore is the one mark Python's readers, its tools and `from <module> import *` read as kept to its module or class, so an internal name without it is taken for part of what the module offers and called from outside, where a change to it breaks the caller. |

### class-name-carries-no-protocol-or-abc-mark → type-name-undecorated · MUST

No class's name carries a mark of its construct. Such marks include an `I` prefix, a `Protocol`, `Interface`, `ABC` or `Type` suffix, and on a `Protocol` or an `ABC` an `Abstract` or `Base` prefix.

| Why |
|---|
| the mark repeats what the class's bases already show, lengthens the name at every use and turns false when the class stops being a `Protocol` or an `ABC`, while the standard library's own, as `Iterable` and `Mapping`, carry none. |

### function-kinds-spelled-on-their-class → function-named-for-what-it-does · SHOULD

Every parse of, conversion into and derived value of a class is spelled on the class. A parse or a conversion into it is a classmethod, and a derived value of it a property; one of a type that is no class of the program's own, such as a `NewType`, is a snake_case module function. Exempt: a parse or a conversion from an outside system's own shape, such as a response or a row, which the code that reaches that system holds; a parse of one value's text, such as an amount's, is none.

| Why |
|---|
| a parse or a conversion kept apart from its class is not found where the standard library's readers look for an alternate constructor, and a derived value written as a method reads as an act; `from` alone is a keyword, so a conversion takes its source after it. |
