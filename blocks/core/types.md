# Types

> Governs a value and its type.

## Modelling

### illegal-state-unrepresentable · MUST
A value with distinct stages is a union keyed by its stage, never a bag of optional fields and flags that allows combinations no stage has.

| Why | Tags |
|---|---|
| a state the type cannot express is a state no code has to handle and no test has to find. | [] |

### closed-set-branched-exhaustively · MUST
A branch over a closed set — a union, an enumeration — names every member, and the type checker proves it exhaustive; no default branch absorbs the rest.

| Why | Tags |
|---|---|
| a new member then fails the check at every place that must decide on it, instead of falling silently into a default. | [] |

### identifier-branded-by-entity · SHOULD
An entity's identifier is a type of its own, branded by its entity, so one entity's identifier is refused where another's is expected.

| Why | Tags |
|---|---|
| two identifiers of one primitive type are swapped silently; a brand makes the type checker refuse it. | [] |

### shape-composed-of-small-shapes · SHOULD
A shared shape is composed of small named shapes — an identifier, timestamps, a page of results — never cut out of a large type by omitting or picking its fields.

| Why | Tags |
|---|---|
| a shape cut from a large one changes whenever the large one does, and hides which fields its consumer needs. | [] |

### type-lives-with-its-consumer · SHOULD
A type lives beside the unit whose signature introduces it, and every other unit imports it from there; it moves to a file of its own when a second consumer appears, and is declared nowhere else — an entry that re-exports it offers it without becoming its home.

| Why | Tags |
|---|---|
| one home per type means one place to change it and no copy to drift. | [] |

### declared-values-never-typed-again · MUST
A set of values the program declares is never typed out again: a subset is a named constant beside the set, and a schema over one of the program’s types derives its values from that type, or is checked against the type it produces.

| Why | Tags |
|---|---|
| a restated set drifts from its source, and a schema stricter or looser than its type locks out, or lets in, what the program does not mean. | [] |

### outside-vocabulary-reached-through-a-total-table · MUST
A vocabulary another party owns — its codes, its statuses — is reached through a total table from it to the program's own values, which the type checker proves complete for every value the program knows.

| Why | Tags |
|---|---|
| a value added to the program's copy of that vocabulary then fails the type check instead of falling through to a default nobody chose. | [data] |

### enumeration-others-read-declared-extensible · MUST
An enumeration in a contract another program reads — an answer, a message, a file — is declared extensible, its readers told to expect values they do not know, and a reader settles a value it does not know as the contract says, never failing for it.

| Why | Tags |
|---|---|
| a reader that fails on a new value breaks on the first one its writer adds, though nothing it relies on changed. | [data] |

### unchecked-type-never-used · MUST
No value, parameter, return or type argument has the type that switches the type checker off, in specs too; one the language infers as that type for lack of an annotation counts as well.

| Why | Tags |
|---|---|
| that type switches the checker off for everything it touches, and it spreads. | [] |

## Invariants

### invariant-checked-at-construction · MUST
A value that must keep an invariant is built only through the function that checks it, so a value that exists is valid.

| Why | Tags |
|---|---|
| no caller has to check the invariant again, or can forget to. | [] |

### invariant-value-is-plain-immutable-data · MUST
A value whose equality is its data and that keeps an invariant is immutable, compared by value and made of data alone, in its language's plain immutable record form, with no identity and no state that changes.

| Why | Tags |
|---|---|
| data alone crosses a cache, a URL and storage as it is, two values with the same data are the same value, and a value no one can change keeps its invariant. | [data] |

### value-immutable-by-default · SHOULD
A value is immutable by default: a change makes a new value, and mutation stays local and deliberate.

| Why | Tags |
|---|---|
| a value no one can change can be shared and reasoned about without tracing who else holds it. | [] |

## Values from outside

### outside-value-untyped-until-parsed · MUST
A value from outside the program — text, a response, a file, a message — has no known type until a schema parses it or plain checks narrow it, in specs as in production, and no cast stands in for either. It is parsed once, where it enters, and trusted after.

| Why | Tags |
|---|---|
| a type written over unparsed data is a promise the data never made, and the first unexpected field breaks code far away. | [security] |

### narrowing-proves-all-it-claims · MUST
A narrowing that claims a type checks every property of it, as running the type’s whole schema does; one that checks one field and claims the whole type is a cast.

| Why | Tags |
|---|---|
| code after the narrowing trusts every property, so a narrowing that checks one is a lie the type checker repeats. | [] |

### own-shape-strict-other-shape-tolerant · MUST
A shape the program owns is parsed strictly — an unknown key or a value of another type fails — and a shape another party owns and may extend is parsed tolerantly: a field it adds is ignored.

| Why | Tags |
|---|---|
| the program’s own shape must carry nothing the program does not know, while another party may add fields at any time. | [data] |

## Kinds of value

### absence-shown-by-the-type · MUST
Absence is spelled by one value, which the language block names, and shown in the type; no other value — an empty string, a minus one, a zero date — stands for it, and an empty collection is empty, not absent. Another spelling appears only where an outside format or an API the code calls imposes it.

| Why | Tags |
|---|---|
| two spellings of absence make every check ask twice, and a stand-in value passes for a real one. | [data] |

### instant-carries-its-zone · MUST
An instant is an exact time — in UTC, or with its offset — kept apart from a calendar date and a wall time, which are types of their own; no time is read in the machine’s zone by default.

| Why | Tags |
|---|---|
| a time without its offset names a different moment on each machine. | [data] |

### duration-measured-on-a-monotonic-clock · MUST
A duration the program measures is read from a monotonic clock, never from the wall clock.

| Why | Tags |
|---|---|
| a wall clock that jumps — a correction, a change of season — corrupts every duration measured across the jump. | [data] |

### text-encoded-as-utf-8 · MUST
Text the program reads or writes — a file, a stream, a message — is UTF-8, named explicitly wherever an interface takes an encoding, never the platform's default; an outside format that fixes another encoding is decoded where it enters.

| Why | Tags |
|---|---|
| a default encoding differs between machines, so the same bytes read as different text in development and in production. | [data] |

### exact-quantity-never-binary-float · MUST
Money and every other exact decimal quantity is an integer of its smallest unit or a decimal type, with its currency or unit in the type, never binary floating point.

| Why | Tags |
|---|---|
| binary floating point cannot hold 0.1 exactly, and a rounding error in money is a bug no review sees. | [data] |
