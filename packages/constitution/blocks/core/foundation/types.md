# Types

> Governs a value and its type.

## Modelling

### illegal-state-unrepresentable · MUST

A value with distinct stages is a union keyed by its stage, never a bag of optional fields and flags that allows combinations no stage has; the moves between its stages are pure transition functions, gathered in a table once they grow.

| Why |
|---|
| a state the type cannot express is a state no code has to handle and no test has to find — make illegal states unrepresentable. |

### closed-set-branched-exhaustively · MUST

A branch over a closed set — a union or an enumeration the logic decides on member by member — names every member; where the language has a type checker, it proves the branch exhaustive and no default branch absorbs the rest, and otherwise its default branch fails as a defect.

| Why |
|---|
| a new member then fails the check at every place that must decide on it, instead of falling silently into a default. |

### closed-name-set-declared-once · MUST

A closed set of named values the program owns is declared once, as one enumeration whose members the code reaches by name, never as literal strings repeated at each use.

| Why |
|---|
| the set is then one declaration with one name for each member, which a search, a rename and the type checker follow to every use, while a literal repeated at each use is changed in some places and missed in others. |

### identifier-branded-by-entity · SHOULD

An entity's identifier is a type of its own, branded by its entity, so one entity's identifier is refused where another's is expected; its type is given only where the identifier is minted, by the one function that makes new ones, or where it enters the program, in the parse of the outside value.

| Why |
|---|
| two identifiers of one primitive type are swapped silently; a brand makes the type checker refuse it, and given in one place it proves the value came through it. |

### shape-composed-of-small-shapes · SHOULD

A shared shape is composed of small named shapes — an identifier, timestamps, a page of results — never cut out of a large type by omitting or picking its fields.

| Why |
|---|
| a shape cut from a large one changes whenever the large one does, and hides which fields its consumer needs. |

### semantic-alias-names-a-shared-meaning · SHOULD

A semantic alias — a name of its own for a plain type, as a chat's title over a string — names a meaning found in two or more places, carries no brand, and is used wherever that meaning appears, never the bare type beside it.

| Why |
|---|
| an alias names a meaning the program shares; one for every string turns vocabulary into noise, and a bare type beside an existing alias hides the meaning again. |

### type-has-one-home · MUST

A type has one home — beside the signature that introduces it, or in the folder the layout gives its kind — every other unit imports it from there or from a surface that re-exports it, and it is declared nowhere else.

| Why |
|---|
| one home per type means one place to change it and no copy to drift. |

### declared-values-never-typed-again · MUST

A set of values the program declares is never typed out again: a subset is a named constant beside the set, and a schema over one of the program’s types derives its values from that type, or is checked against the type it produces.

| Why |
|---|
| a restated set drifts from its source, and a schema stricter or looser than its type locks out, or lets in, what the program does not mean. |

### outside-vocabulary-reached-through-a-total-table · MUST

A vocabulary another party owns — its codes, its statuses — is reached through a total table from it to the program's own values, which the type checker proves complete for every value the program knows; a value it does not know, in a vocabulary its party may extend, maps to a member of the program's own for the unknown, which every branch names, and never fails the read.

| Why |
|---|
| a value added to the program's copy of that vocabulary then fails the type check instead of falling through to a default nobody chose. |

### outside-number-set-declared-once · MUST

A set of numbers another system defines — its status codes, its exit codes — is declared once, with every value written, and a number that arrives stays a number until it is compared with them.

| Why |
|---|
| one declaration names each number where a reader looks for it, and a number cast to the program's own type on arrival claims a value the other side may never have sent. |

### enumeration-others-read-declared-extensible · MUST

An enumeration the program writes into a contract another program reads — an answer, a message, a file — is declared extensible, its readers told to expect values they do not know, save a set complete by its meaning — a sort direction, the days of the week — which stays closed.

| Why |
|---|
| a reader that fails on a new value breaks on the first one its writer adds, though nothing it relies on changed. |

### unchecked-type-never-used · MUST

No value, parameter, return or type argument has the type that switches the type checker off, in specs too; one the language infers as that type for lack of an annotation counts as well.

| Why |
|---|
| that type switches the checker off for everything it touches, and it spreads. |

## Invariants

### invariant-checked-at-construction · MUST

A value that must keep an invariant is built only through the function that checks it, so a value that exists is valid.

| Why |
|---|
| no caller has to check the invariant again, or can forget to. |

### invariant-value-is-plain-immutable-data · MUST

A value whose equality is its data and that keeps an invariant is immutable, compared by value and made of data alone, in its language's plain immutable record form, with no identity and no state that changes.

| Why |
|---|
| data alone crosses a cache, a URL and storage as it is, two values with the same data are the same value, and a value no one can change keeps its invariant. |

### value-immutable-by-default · SHOULD

A value is immutable by default: a change makes a new value, and mutation stays local and deliberate.

| Why |
|---|
| a value no one can change can be shared and reasoned about without tracing who else holds it. |

## Values from outside

### outside-value-untyped-until-parsed · MUST

A value from outside the program — text, a response, a file, a message — has no known type until a schema parses it or plain checks narrow it, in specs as in production, and no cast stands in for either. It is parsed once, where it enters, and trusted after.

| Why |
|---|
| a type written over unparsed data is a promise the data never made, and the first unexpected field breaks code far away — parse, don't validate. |

### narrowing-proves-all-it-claims · MUST

A narrowing that claims a type checks every property of it, as running the type’s whole schema does; one that checks one field and claims the whole type is a cast.

| Why |
|---|
| code after the narrowing trusts every property, so a narrowing that checks one is a lie the type checker repeats. |

### own-shape-strict-other-shape-tolerant · MUST

A shape the program owns is parsed strictly — an unknown key, a value of another type or a value outside an enumeration of a request it accepts fails — and a shape another party owns and may extend is parsed tolerantly: a field it adds is ignored.

| Why |
|---|
| the program’s own shape must carry nothing the program does not know, while another party may add fields at any time. |

## Kinds of value

### mapping-key-unique · MUST

A key appears once in its mapping — an object, a table, a dictionary written as data.

| Why |
|---|
| most parsers keep the last value of a repeated key silently, so the first one reads as set while it does nothing. |

### absence-shown-by-the-type · MUST

Absence is spelled by one value, which the language block names, and shown in the type; no other value — an empty string, a minus one, a zero date — stands for it, and an empty collection is empty, not absent. Another spelling appears only where an outside format or an API the code calls imposes it.

| Why |
|---|
| two spellings of absence make every check ask twice, and a stand-in value passes for a real one. |

### instant-is-an-exact-time · MUST

An instant is an exact time — in UTC, or with its offset — kept apart from a calendar date and a wall time, which are types of their own; a time a person sets in a place — a meeting, a departure, an opening hour — is kept as its wall time with that place's IANA zone, and becomes an instant only when it is used; no time is read in the machine’s zone by default.

| Why |
|---|
| a time without its offset names a different moment on each machine, and a future time a person sets moves with its zone's rules, which only its wall time and its zone keep. |

### duration-measured-on-a-monotonic-clock · MUST

A duration the program measures is read from a monotonic clock, never from the wall clock.

| Why |
|---|
| a wall clock that jumps — a correction, a change of season — corrupts every duration measured across the jump. |

### text-encoded-as-utf-8 · MUST

Text the program reads or writes — a file, a stream, a message — is UTF-8, named explicitly wherever an interface takes an encoding, never the platform's default; an outside format that fixes another encoding is decoded where it enters and encoded where it leaves.

| Why |
|---|
| a default encoding differs between machines, so the same bytes read as different text in development and in production. |

### machine-text-independent-of-the-locale · MUST

Text written for another program — a number, a date, a key, an identifier — is formatted, parsed, compared and cased independently of the locale the process runs in.

| Why |
|---|
| the same code writes `1,5` for one user and `1.5` for another, or upper-cases `i` to `İ`, and the reader on the other side refuses or misreads it. |

### exact-quantity-never-binary-float · MUST

Money and every other exact decimal quantity is an integer of its smallest unit or a decimal type, with its currency or unit in the type, never binary floating point.

| Why |
|---|
| binary floating point cannot hold 0.1 exactly, and a rounding error in money is a bug no review sees. |
