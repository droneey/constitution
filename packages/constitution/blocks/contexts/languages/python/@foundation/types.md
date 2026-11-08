# Types

> Governs how Python types the program: absence, unchecked types, narrowing, enumerations and new types, generics, frozen values, and the values of time, money and paths.

## Vocabulary

Absence is spelled **`None`**{#absent}, and a value with an invariant is built by its class called as **`<Type>(<value>)`**{#checked-constructor}, its checked constructor.

## General

### generics-in-pep-695-form · MUST

Every generic declares its type parameters in its own header. This holds for a class, a function and a type alias, and none declares them through `TypeVar`, `Generic` or `TypeAlias`.

| Why |
|---|
| a type parameter declared through `TypeVar` sits at module level, apart from the generic that uses it, where a reader must look up its bound and its variance and any other declaration of the module can reach it, while every Python this block supports has the header form — PEP 695. |

### annotation-written-unquoted · MUST

Wherever the code's `requires-python` floor is 3.14 or later, every annotation is written unquoted. No module then imports `from __future__ import annotations`.

| Why |
|---|
| a quoted annotation, or the future import, turns annotations into strings that code reading them at run time, such as a parser or a framework's injection, cannot always resolve, while from 3.14 the language evaluates them lazily by itself. |

## Modelling

### staged-value-is-a-union-of-dataclasses → illegal-state-unrepresentable · MUST

Every value with distinct stages is a union of dataclasses, one per stage. Each holds only its stage's fields.

| Why |
|---|
| one class for every stage carries fields that most stages leave empty, so code reads a field its stage never set, while a class per stage gives each branch on it only the fields its stage has — make illegal states unrepresentable. |

### closed-set-match-ends-in-assert-never → closed-set-branched-exhaustively · MUST

Every branch over a closed set ends in `assert_never`. A `match` or an `if` chain over an enumeration, a union of classes or a union of literals names every member in a branch and ends in `assert_never(value)`, with no other default branch.

| Why |
|---|
| `assert_never` fails the type check wherever a member added to the set is not handled, and raises if one arrives at run time. |

### outside-number-set-is-an-int-enum → outside-vocabulary-reached-through-a-total-table · MUST

Every set of numbers another system defines is an `enum.IntEnum` whose members hold those numbers, the keys of its total table. Such sets include exit statuses and HTTP statuses. The enumeration is the program's own or the standard library's, such as `http.HTTPStatus`.

| Why |
|---|
| the numbers are fixed by the other system, so a string enumeration would hold a second spelling the other side never reads. |

### int-enum-member-number-never-left-to-auto → outside-code-written-out-on-its-member · MUST

No member of an `enum.IntEnum` of another system's numbers has its number left to `auto()`.

| Why |
|---|
| a number left to `auto()` follows the member's place in the list, so a member added or moved drifts from the number the other system sends. |

### outside-number-never-converted-by-its-enumeration → unknown-outside-value-mapped-to-its-own-member · MUST

No number another system sends is converted by calling its enumeration. It stays an `int` until the total table maps it.

| Why |
|---|
| calling the enumeration raises on the first number the other system adds, while a lookup in the table can map it to the program's member for the unknown. |

### identifier-is-a-new-type → identifier-branded-by-entity · SHOULD

Every identifier is a `NewType` over its primitive, named after what it identifies. Exempt: an identifier that keeps an invariant, such as a slug or a tenant's code, which `invariant-value-is-a-frozen-dataclass` governs.

| Why |
|---|
| two identifiers typed by one primitive are swapped unseen, while the type checker refuses one `NewType` where another is expected, at no cost at run time, where the value is the primitive itself. |

### enumeration-is-a-unique-str-enum → closed-set-declared-as-one-enumeration · MUST

Every closed set of named values the program owns is an `enum.StrEnum` marked `@unique`. It is never a union of `Literal` strings.

| Why |
|---|
| a second name for one value is an alias, not a member, so the set holds fewer members than it writes, and `@unique` refuses that second name. |

### str-enum-member-value-never-left-to-auto · MUST

No member of an `enum.StrEnum` the program owns has its value left to `auto()`. Each value is written out as the string the program stores and sends.

| Why |
|---|
| a value written out survives a member's rename, which `auto()` would carry into every stored record and message. |

### entity-value-or-event-is-a-frozen-dataclass → value-immutable-by-default · SHOULD

Every type of an entity, a value equal by its data or an event is an immutable dataclass. It is declared with `frozen=True, slots=True`, its sequences are tuples, and its maps are a `frozendict` where the `requires-python` floor is 3.15 or later, typed `Mapping` below it. Exempt: a value with an invariant that is equal by its data, which `invariant-value-is-a-frozen-dataclass` governs.

| Why |
|---|
| a mutable dataclass lets any holder change the value under every other holder, one without slots can still be changed through its `__dict__`, and a `dict` behind `Mapping` makes the value unhashable where a `frozendict` keeps it hashable. |

### entity-value-or-event-dataclass-declared-kw-only → parts-of-one-whole-passed-by-name · SHOULD

Every dataclass of an entity, a value equal by its data or an event is declared `kw_only=True`.

| Why |
|---|
| a field set by position is swapped unseen with another of its type, and a field added between two others shifts every call that builds the value. |

### received-collection-typed-read-only → value-immutable-by-default · SHOULD

Every collection parameter or field the code only reads is typed read-only. It takes a type such as `Sequence`, `Mapping`, `AbstractSet` or `tuple`, never `list`, `dict` or `set`.

| Why |
|---|
| a collection typed `list` or `dict` lets the code that receives it sort it or add to it in place unseen, while a read-only type makes the type checker refuse every such change. |

### collection-with-another-holder-changed-by-sorted-or-unpacking → value-immutable-by-default · MUST

Every collection with another holder, one the code received or handed on, is changed only into a new value. The new value is made by `sorted()`, `[*items, item]` or `{**mapping, key: value}`, never by `sort`, `append` or an assignment to an index or a key of that collection.

| Why |
|---|
| a collection changed in place changes under its caller, so a sort made for one use reorders the data the caller still holds and reads. |

## Type checking

### typing-any-never-written → unchecked-type-never-used · MUST

No code writes `Any`. It appears in no annotation and in no generic's arguments, such as `dict[str, Any]`, and no parameter, return or generic argument is left unannotated, which reads as `Any`.

| Why |
|---|
| `Any` passes every check in both directions, so one unannotated parameter spreads unchecked values into every caller and callee. |

### typing-cast-never-written → narrowing-proves-all-it-claims · MUST

No `typing.cast` is written.

| Why |
|---|
| a cast claims a type no check proved and the type checker believes it, so the failure surfaces later, far from the line that claimed it. |

### narrowing-function-returns-typeis → narrowing-proves-all-it-claims · MUST

Every function that narrows its argument returns `TypeIs[T]`, never `TypeGuard[T]`. Exempt: a `T` that is no subtype of the argument's type, for which it returns `TypeGuard[T]`.

| Why |
|---|
| `TypeIs` narrows the false branch by the same check, while `TypeGuard` narrows only the true one and lets a function claim a type unrelated to what it was given. |

## Invariants

### invariant-value-is-a-frozen-dataclass → invariant-value-is-plain-immutable-data · MUST

Every value with an invariant that is equal by its data is an immutable dataclass of immutable fields. It is declared with `frozen=True, slots=True` and is never a `NamedTuple` or a parsing library's model. Each field is immutable, such as a `str`, an `int`, a `Decimal`, a `tuple`, a `frozenset` or another such value, and a map is a `frozendict` where the `requires-python` floor is 3.15 or later and a tuple of its key-value pairs below it.

| Why |
|---|
| the generated `__eq__` and `__hash__` then compare and hash it by its data, while a `dict` field, even behind `Mapping`, changes under the check and leaves it unhashable, a `NamedTuple` equals any tuple of the same items and a parsing library's model carries the library's behaviour beside the data. |

### invariant-checked-in-post-init → invariant-checked-at-construction · MUST

Every dataclass that keeps an invariant checks it in `__post_init__`, so its class is its own checked constructor.

| Why |
|---|
| a check kept in a function of its own is skipped by every other way of building the value (the constructor, `replace`, a parser) while each of them passes through `__post_init__` — parse, don't validate. |

## Values from outside

### outside-value-typed-object-until-parsed → outside-value-untyped-until-parsed · MUST

Every value from outside the program is typed `object` until it is parsed or narrowed. This includes `json.loads`'s result; a schema parses it, and `isinstance` and `in` checks narrow it.

| Why |
|---|
| a value from outside typed `Any`, or by a type nobody checked, is used unchecked and breaks on its first unexpected field far from where it entered, while the type checker refuses every use of an `object` value until a check narrows it — parse, don't validate. |

## Kinds of value

### absence-spelled-none → absence-spelled-by-one-value · MUST

Every absent value is `None`, typed `T | None`. Exempt: another spelling that an outside format or an API the code calls imposes, and a “not given” where `None` is itself a value, which `not-given-spelled-by-one-sentinel` governs.

| Why |
|---|
| a second spelling of absence, such as an empty string or a `-1`, needs a second check, which some code forgets, while an optional type makes the type checker ask for the one check `None` needs. |

### not-given-spelled-by-one-sentinel · MUST

Wherever `None` is itself a value a caller passes, every “not given” is one sentinel declared once. A patch that clears a field passes such a `None`, and the sentinel is the built-in `sentinel` where the `requires-python` floor is 3.15 or later, a one-member enumeration below it.

| Why |
|---|
| without a declared sentinel “not given” and “cleared” are one `None`, so a patch clears a field its caller never named, and two sentinels for one meaning fail each other's identity check. |

### absence-tested-by-is-none → absence-spelled-by-one-value · MUST

Every test of absence is `is None` or `is not None`. A default for an absent value is chosen on that test, never by `if not x` or `x or default` where the value is not a `bool`.

| Why |
|---|
| a negation and an `or` also treat `0`, `''` and `[]` as absent, a bug waiting for its input. |

### instant-is-an-aware-datetime → instant-is-an-exact-time · MUST

Every `datetime` carries its time zone. `now` and `fromtimestamp` are given a `tz`, the constructor a `tzinfo` and `strptime` a `%z`, and `datetime.utcnow`, `datetime.utcfromtimestamp`, `datetime.today` and `date.today` are never called.

| Why |
|---|
| a naive `datetime` is read in the machine's zone by one function and in UTC by the next, and the two compare as if they were the same instant. |

### wall-time-kept-with-its-zoneinfo → person-set-time-kept-with-its-zone · MUST

Every time a person sets in a place is a `datetime` of its wall time with that place's `zoneinfo.ZoneInfo`. The kept value is never converted to UTC or to a fixed offset.

| Why |
|---|
| a time converted to UTC or to a fixed offset when it is kept stays put when its zone's rules change, so the meeting the person set at ten moves to nine or eleven. |

### duration-measured-by-a-python-monotonic-clock → duration-measured-on-a-monotonic-clock · MUST

Every duration the program measures is read from one of Python's monotonic clocks. Such clocks include `time.monotonic()`, `time.perf_counter()`, their `_ns` forms and an event loop's `loop.time()`, and a duration is never a difference of `time.time()` or of two `datetime.now()`.

| Why |
|---|
| the wall clock jumps when it is corrected, and a duration measured across the jump is wrong or negative. |

### exact-quantity-is-an-int-or-a-decimal → exact-quantity-never-binary-float · MUST

Every exact decimal quantity is an `int` of its smallest unit or a `decimal.Decimal`. A `Decimal` is built from a string or an `int`, never from a `float`.

| Why |
|---|
| `Decimal(0.1)` keeps the binary error of the float it was given, while `Decimal('0.1')` is exact. |

### path-handled-by-pathlib · SHOULD

Every file-system path is a `pathlib.Path`. It is joined with `/` and read through its methods, never a string built with `os.path`.

| Why |
|---|
| one object joins, resolves and reads a path, where a string path is joined by hand and a separator or a `..` slips through. |
