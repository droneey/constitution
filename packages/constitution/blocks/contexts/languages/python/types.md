# Types

> Governs how Python types the program: absence, unchecked types, narrowing, enumerations and new types, generics, frozen values, and the values of time, money and text.

### absence-spelled-none → absence-shown-by-the-type · MUST

Absence is `None`, typed `T | None`, and no other value stands for it. Where `None` is itself a value a caller passes — a patch that clears a field — “not given” is one sentinel declared once: the built-in `sentinel` from Python 3.15, and below it a one-member enumeration.

| Why | Tags |
|---|---|
| a second spelling of absence needs a second check, and a sentinel the type names keeps “not given” apart from “cleared” without an object the checker cannot see through. | [] |

### typing-any-never-written → unchecked-type-never-used · MUST

`Any` is written nowhere — not in an annotation, a `cast` or a generic's arguments such as `dict[str, Any]` — and no parameter, return or generic argument is left unannotated, which reads as `Any`.

| Why | Tags |
|---|---|
| `Any` passes every check in both directions, so one unannotated parameter spreads unchecked values into every caller and callee. | [] |

### boundary-values-object-until-parsed → outside-value-untyped-until-parsed · MUST

A value from outside the program — `json.loads`'s result included — is typed `object` until a model parses it or `isinstance` and `in` checks narrow it; a `cast` narrows nothing.

| Why | Tags |
|---|---|
| the type checker refuses every use of an `object` value until a check narrows it, where `Any` would allow them all. | [] |

### narrowing-function-returns-typeis → narrowing-proves-all-it-claims · MUST

A function that narrows its argument returns `TypeIs[T]`, never `TypeGuard[T]`, unless `T` is no subtype of the argument's type.

| Why | Tags |
|---|---|
| `TypeIs` narrows the false branch by the same check, while `TypeGuard` narrows only the true one and lets a function claim a type unrelated to what it was given. | [] |

### staged-value-is-a-union-of-dataclasses → illegal-state-unrepresentable · MUST

A value with distinct stages is a union of dataclasses, one per stage, each holding only its stage's fields, and code tells the stages apart by `match` on their classes.

| Why | Tags |
|---|---|
| the class is the stage's key, so no stage carries a field another stage needs, and each `case` sees only the fields its stage has. | [] |

### closed-set-match-ends-in-assert-never → closed-set-branched-exhaustively · MUST

A `match` or an `if` chain over a closed set — an enumeration, a union of classes or of literals — names every member in a branch and ends in `assert_never(value)`, with no other default branch.

| Why | Tags |
|---|---|
| `assert_never` fails the type check wherever a member added to the set is not handled, and raises if one arrives at run time. | [] |

### enumeration-is-a-unique-str-enum · MUST

A closed set of named values the program owns is an `enum.StrEnum` marked `@unique`, never a union of `Literal` strings, each member's value written out as the string the program stores and sends, never `auto()`.

| Why | Tags |
|---|---|
| a value written out survives a member's rename, which `auto()` would carry into every stored record and message, and `@unique` refuses two names for one value. | [] |

### outside-number-set-is-an-int-enum → outside-vocabulary-reached-through-a-total-table · MUST

A set of numbers another system defines — exit statuses, HTTP statuses — is an `enum.IntEnum` with every member's value written, or the standard library's own such as `http.HTTPStatus`; a number that arrives stays an `int` until it is compared with the members, never converted by calling the enumeration.

| Why | Tags |
|---|---|
| the numbers are fixed by the other system, so the members carry its values, and a string enumeration would hold a copy that the other side never reads. | [] |

### identifier-is-a-new-type → identifier-branded-by-entity · SHOULD

An entity's identifier is a `NewType` over its primitive: `OrderId = NewType('OrderId', UUID)`.

| Why | Tags |
|---|---|
| the type checker refuses an `OrderId` where a `CustomerId` is expected, and at run time the value is the primitive itself, at no cost. | [] |

### generics-in-pep-695-form · MUST

A generic class, function or type alias declares its type parameters in its own header — `class Box[T]`, `def first[T](items: Sequence[T]) -> T`, `type Orders = list[Order]` — never through `TypeVar`, `Generic` or `TypeAlias`.

| Why | Tags |
|---|---|
| the parameters are declared where they are used and reach nothing outside the declaration, and every Python the language block supports has the syntax. | [] |

### annotation-written-unquoted · SHOULD

Where the floor is Python 3.14 or later, an annotation is written unquoted, and no module imports `from __future__ import annotations`.

| Why | Tags |
|---|---|
| the language then evaluates annotations lazily by itself, and code that reads them at run time — a parser, a framework's injection — resolves them as written, which the future import's strings do not always allow. | [] |

### business-types-frozen-dataclasses → value-immutable-by-default · SHOULD

A type of the program's business data is a dataclass with `frozen=True, slots=True, kw_only=True`, its sequences tuples and its maps a `frozendict` where the floor is Python 3.15, typed `Mapping` below it.

| Why | Tags |
|---|---|
| the runtime then refuses a mutation the business never meant, each field is set by its name, and a `frozendict` keeps the value hashable where a `dict` behind `Mapping` does not. | [] |

### invariant-value-is-a-frozen-dataclass → invariant-value-is-plain-immutable-data · MUST

A value that keeps an invariant is a dataclass with `frozen=True, slots=True`, whose every field is immutable — a `str`, an `int`, a `Decimal`, a `tuple`, a `frozenset`, a `frozendict` where the floor is Python 3.15, or another such value — and never a `NamedTuple` or a parsing library's model.

| Why | Tags |
|---|---|
| the generated `__eq__` and `__hash__` then compare and hash it by its data, while a `NamedTuple` equals any tuple of the same items and a parsing library's model carries the library's behaviour beside the data. | [] |

### invariant-checked-in-post-init → invariant-checked-at-construction · MUST

A dataclass that keeps an invariant checks it in `__post_init__` and raises an expected failure of the program's own when it fails.

| Why | Tags |
|---|---|
| every way of building the value — the constructor, `replace`, a parser — passes through `__post_init__`, so a value that exists is valid. | [] |

### instant-is-an-aware-datetime → instant-is-an-exact-time · MUST

A `datetime` carries its time zone: `now` and `fromtimestamp` are given one, the constructor and `strptime` produce one, and `datetime.utcnow`, `datetime.utcfromtimestamp`, `datetime.today` and `date.today` are never called; a time set in a place keeps its wall time with its `zoneinfo.ZoneInfo`.

| Why | Tags |
|---|---|
| a naive `datetime` is read in the machine's zone by one function and in UTC by the next, and the two compare as if they were the same instant. | [data] |

### duration-measured-by-time-monotonic → duration-measured-on-a-monotonic-clock · MUST

A duration is measured by `time.monotonic()` or `time.perf_counter()`, never as a difference of `time.time()` or of two `datetime.now()`.

| Why | Tags |
|---|---|
| the wall clock jumps when it is corrected, and a duration measured across the jump is wrong or negative. | [data] |

### exact-quantity-is-an-int-or-a-decimal → exact-quantity-never-binary-float · MUST

An exact decimal quantity is an `int` of its smallest unit or a `decimal.Decimal` built from a string or an `int`, never from a `float`, typed by its unit or currency — a `NewType` for each.

| Why | Tags |
|---|---|
| `Decimal(0.1)` keeps the binary error of the float it was given, while `Decimal('0.1')` is exact. | [data] |

### text-opened-with-utf-8-named → text-encoded-as-utf-8 · MUST

Every call that opens or decodes text — `open`, `Path.open`, `Path.read_text`, `Path.write_text`, a `subprocess` call with `text=True` — names `encoding='utf-8'`.

| Why | Tags |
|---|---|
| below Python 3.15 these calls default to the machine's locale, and from 3.15 a host's `PYTHONUTF8=0` brings it back, so the same file reads as different text on two machines. | [] |

### machine-text-never-formatted-by-the-locale-module → machine-text-independent-of-the-locale · MUST

Text written for another program uses no call of the `locale` module, no `'{:n}'` and no `strftime` directive that reads the locale — `%a`, `%b`, `%c`, `%p`, `%x`, `%X`; an instant is written by `isoformat()`.

| Why | Tags |
|---|---|
| these forms read the locale of the process, so the same value is written differently on each machine. | [data] |
