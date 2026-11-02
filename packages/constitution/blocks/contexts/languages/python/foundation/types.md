# Types

> Governs how Python types the program: absence, unchecked types, narrowing, enumerations and new types, generics, frozen values, and the values of time, money, text and paths.

## General

### generics-in-pep-695-form · MUST

A generic declares its type parameters in its own header. This holds for a class, a function and a type alias, and none declares them through `TypeVar`, `Generic` or `TypeAlias`.

| Why |
|---|
| a type parameter declared through `TypeVar` sits at module level, apart from the generic that uses it, where a reader must look up its bound and its variance and any other declaration of the module can reach it; every Python this block supports has the header form — PEP 695. |

### annotation-written-unquoted · SHOULD

An annotation is written unquoted where the floor is Python 3.14 or later. No module then imports `from __future__ import annotations`.

| Why |
|---|
| a quoted annotation, or the future import, turns annotations into strings that code reading them at run time, such as a parser or a framework's injection, cannot always resolve, while from 3.14 the language evaluates them lazily by itself. |

## Modelling

### typing-any-never-written → unchecked-type-never-used · MUST

`Any` is written nowhere. It appears in no annotation and in no generic's arguments such as `dict[str, Any]`, and no parameter, return or generic argument is left unannotated, which reads as `Any`.

| Why |
|---|
| `Any` passes every check in both directions, so one unannotated parameter spreads unchecked values into every caller and callee. |

### staged-value-is-a-union-of-dataclasses → illegal-state-unrepresentable · MUST

A value with distinct stages is a union of dataclasses, one per stage. Each holds only its stage's fields, and code tells the stages apart by `match` on their classes.

| Why |
|---|
| one class for every stage carries fields that most stages leave empty, so code reads a field its stage never set, while a class per stage gives each `case` only the fields its stage has — make illegal states unrepresentable. |

### closed-set-match-ends-in-assert-never → closed-set-branched-exhaustively · MUST

A branch over a closed set ends in `assert_never`. A `match` or an `if` chain over a closed set — an enumeration, a union of classes or of literals — names every member in a branch and ends in `assert_never(value)`, with no other default branch.

| Why |
|---|
| `assert_never` fails the type check wherever a member added to the set is not handled, and raises if one arrives at run time. |

### outside-number-set-is-an-int-enum → closed-name-set-declared-once · MUST

A set of numbers another system defines is an `enum.IntEnum`. Such a set — exit statuses, HTTP statuses — has every member's value written, or is the standard library's own, such as `http.HTTPStatus`; a number that arrives stays an `int` until it is compared with the members, never converted by calling the enumeration.

| Why |
|---|
| the numbers are fixed by the other system, so a string enumeration would hold a copy the other side never reads, and a number converted by calling the enumeration raises on the first value the other system adds. |

### identifier-is-a-new-type → identifier-branded-by-entity · SHOULD

An identifier is a `NewType` over its primitive, named after what it identifies.

| Why |
|---|
| two identifiers typed by one primitive are swapped unseen, while the type checker refuses one `NewType` where another is expected, at no cost at run time, where the value is the primitive itself. |

### enumeration-is-a-unique-str-enum → closed-name-set-declared-once · MUST

A closed set of named values the program owns is an `enum.StrEnum` marked `@unique`. It is never a union of `Literal` strings, and each member's value is written out as the string the program stores and sends, never `auto()`.

| Why |
|---|
| a value written out survives a member's rename, which `auto()` would carry into every stored record and message, and `@unique` refuses two names for one value. |

## Invariants

### business-types-frozen-dataclasses → value-immutable-by-default · SHOULD

A type of the program's business data is a frozen dataclass. It is declared with `frozen=True, slots=True, kw_only=True`, its sequences are tuples, and its maps are a `frozendict` where the floor is Python 3.15, typed `Mapping` below it.

| Why |
|---|
| a mutable dataclass lets any holder change business data under every other holder, a field set by position is swapped unseen, and a `dict` behind `Mapping` makes the value unhashable where a `frozendict` keeps it hashable. |

### received-collection-typed-read-only → value-immutable-by-default · SHOULD

A collection the code only reads is typed read-only, and a changed one is a new value. This holds for a parameter or a field: its type is `Sequence`, `Mapping` or `AbstractSet`, never `list`, `dict` or `set`, and a new value is made — `sorted()`, `[*items, item]`, `{**mapping, key: value}` — never `sort`, `append` or an assignment to an index or a key of what was received.

| Why |
|---|
| a collection typed `list` or `dict` can be sorted or added to in place, so a sort made for one use reorders the data its caller still holds and reads, which the read-only types make the type checker refuse. |

### invariant-value-is-a-frozen-dataclass → invariant-value-is-plain-immutable-data · MUST

A value that keeps an invariant is a frozen dataclass of immutable fields. It is declared with `frozen=True, slots=True`, every field is immutable — a `str`, an `int`, a `Decimal`, a `tuple`, a `frozenset`, a `frozendict` where the floor is Python 3.15, or another such value — and it is never a `NamedTuple` or a parsing library's model.

| Why |
|---|
| the generated `__eq__` and `__hash__` then compare and hash it by its data, while a `NamedTuple` equals any tuple of the same items and a parsing library's model carries the library's behaviour beside the data. |

### invariant-checked-in-post-init → invariant-checked-at-construction · MUST

A dataclass that keeps an invariant checks it in `__post_init__`. It is its own checked constructor, **`<Type>(<value>)`**{#checked-constructor}, and raises an expected failure of the program's own when the check fails.

| Why |
|---|
| a check kept in a function of its own is skipped by every other way of building the value (the constructor, `replace`, a parser) while each of them passes through `__post_init__` — parse, don't validate. |

## Values from outside

### outside-value-object-until-parsed → outside-value-untyped-until-parsed · MUST

A value from outside the program is typed `object` until it is parsed or narrowed. This includes `json.loads`'s result; a schema parses it, and `isinstance` and `in` checks narrow it.

| Why |
|---|
| a value from outside typed `Any`, or by a type nobody checked, is used unchecked and breaks on its first unexpected field far from where it entered, while the type checker refuses every use of an `object` value until a check narrows it — parse, don't validate. |

### cast-never-written → narrowing-proves-all-it-claims · MUST

No `typing.cast` is written.

| Why |
|---|
| a cast claims a type no check proved and the type checker believes it, so the failure surfaces later, far from the line that claimed it. |

### narrowing-function-returns-typeis → narrowing-proves-all-it-claims · MUST

A function that narrows its argument returns `TypeIs[T]`, never `TypeGuard[T]`. Only where `T` is no subtype of the argument's type may it return `TypeGuard[T]`.

| Why |
|---|
| `TypeIs` narrows the false branch by the same check, while `TypeGuard` narrows only the true one and lets a function claim a type unrelated to what it was given. |

## Kinds of value

### absence-spelled-none → absence-shown-by-the-type · MUST

Absence is **`None`**{#absent}, typed `T | None`, and no other value stands for it. Where `None` is itself a value a caller passes — a patch that clears a field — “not given” is one sentinel declared once: the built-in `sentinel` from Python 3.15, and below it a one-member enumeration.

| Why |
|---|
| a second spelling of absence needs a second check, which some code forgets, and without a declared sentinel “not given” and “cleared” are one `None`, so a patch clears a field its caller never named. |

### absence-tested-by-is-none → absence-shown-by-the-type · MUST

An absent value is tested by `is None` or `is not None`. It is replaced by a conditional expression on that test, never by `if not x` or `x or default` where the value is not a `bool`.

| Why |
|---|
| a negation and an `or` also treat `0`, `''` and `[]` as absent, a bug waiting for its input. |

### instant-is-an-aware-datetime → instant-is-an-exact-time · MUST

A `datetime` carries its time zone. `now` and `fromtimestamp` are given one, the constructor and `strptime` produce one, and `datetime.utcnow`, `datetime.utcfromtimestamp`, `datetime.today` and `date.today` are never called; a time set in a place keeps its wall time with its `zoneinfo.ZoneInfo`.

| Why |
|---|
| a naive `datetime` is read in the machine's zone by one function and in UTC by the next, and the two compare as if they were the same instant. |

### duration-measured-by-time-monotonic → duration-measured-on-a-monotonic-clock · MUST

A duration is measured by `time.monotonic()` or `time.perf_counter()`, never as a difference of `time.time()` or of two `datetime.now()`.

| Why |
|---|
| the wall clock jumps when it is corrected, and a duration measured across the jump is wrong or negative. |

### exact-quantity-is-an-int-or-a-decimal → exact-quantity-never-binary-float · MUST

An exact decimal quantity is an `int` of its smallest unit or a `decimal.Decimal`. A `Decimal` is built from a string or an `int`, never from a `float`, and the quantity is typed by its unit or currency — a `NewType` for each.

| Why |
|---|
| `Decimal(0.1)` keeps the binary error of the float it was given, while `Decimal('0.1')` is exact. |

### text-opened-with-utf-8-named → text-encoded-as-utf-8 · MUST

Every call that opens or decodes text names `encoding='utf-8'`. Such calls include `open`, `Path.open`, `Path.read_text`, `Path.write_text` and a `subprocess` call with `text=True`.

| Why |
|---|
| below Python 3.15 these calls default to the machine's locale, and from 3.15 a host's `PYTHONUTF8=0` brings it back, so the same file reads as different text on two machines. |

### machine-text-never-formatted-by-the-locale-module → machine-text-independent-of-the-locale · MUST

Text written for another program never reads the locale. It uses no call of the `locale` module, no `'{:n}'` and no `strftime` directive that reads the locale — `%a`, `%b`, `%c`, `%p`, `%x`, `%X` — and an instant is written by `isoformat()`.

| Why |
|---|
| these forms read the locale of the process, so the same value is written differently on each machine. |

### path-handled-by-pathlib · SHOULD

A file-system path is a `pathlib.Path`. It is joined with `/` and read through its methods, never a string built with `os.path`.

| Why |
|---|
| one object joins, resolves and reads a path, where a string path is joined by hand and a separator or a `..` slips through. |
