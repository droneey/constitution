# Types

> Governs a value and its type.

## The vocabulary

An **entity** is a value with an identity that lives through its changes: it stays the same entity whatever its other data, and its identifier tells it apart from every other.

## Modelling

### illegal-state-unrepresentable · MUST

A value with distinct stages is a union keyed by its stage, never a bag of optional fields and flags that allows combinations no stage has. The union takes its language's form — a tagged union, a sealed hierarchy, a closed set of implementations.

| Why |
|---|
| a bag of optional fields and flags lets code build a combination no stage has, which every reader must guard against and some code will one day produce — make illegal states unrepresentable. |

### closed-set-branched-exhaustively · MUST

A branch over a closed set names every member. A closed set is a union or an enumeration the logic decides on member by member. Where the language's type checker or a check the project runs proves the branch exhaustive, no default branch absorbs the rest; otherwise the branch's default fails as a defect.

| Why |
|---|
| a branch with a default takes a new member silently into a case nobody chose for it, and no check shows the places that must decide on it. |

### closed-set-decided-in-one-place · SHOULD

What a member of a closed set means for one concern is decided in one place. Concerns include a label, a price rule and a next step; when several concerns branch on the same members, what each member means for them is gathered in one record keyed by member, which the type checker proves complete, or in one function whose exhaustive branch gives each member's meaning.

| Why |
|---|
| a set decided on in many places must change in each when a member is added, and the place missed decides for the new member by accident — a single source of truth. |

### closed-name-set-declared-once · MUST

A closed set of named values is declared once, as one enumeration. The set is the program's own, or the numbers another system defines, as its status or exit codes; every member is written, and the code reaches it by name, never as a literal repeated at each use. A number that arrives stays a number until it is compared with the set.

| Why |
|---|
| a literal repeated at each use is changed in some places and missed in others, where one declaration gives each member one name that a search, a rename and the type checker follow to every use — a single source of truth. |

### identifier-branded-by-entity · SHOULD

An entity's identifier is a distinct type of its own, its entity's. One entity's identifier is then refused where another's is expected, and its type is given only where the identifier is minted, by the one function that makes new ones, or where it enters the program, in the parse of the outside value.

| Why |
|---|
| two identifiers of one primitive type are swapped silently; a distinct type makes the type checker refuse it, and given in one place it proves the value came through it. |

### entity-compared-by-its-identifier · SHOULD

Two entities are the same entity when their identifiers are equal, whatever their other data. Code tells entities apart only by their identifiers, never by comparing their whole data.

| Why |
|---|
| an entity's data changes through its life, so two snapshots of one entity differ in every field a change touched, and a comparison of their data counts one entity as two — the entity pattern. |

### type-has-one-home · MUST

A type has one home and is declared nowhere else. Its home is beside the signature that introduces it, or in the folder the layout gives its kind, and every other unit imports it from there or from a surface that re-exports it.

| Why |
|---|
| a type declared twice drifts the first time one copy changes, and a value of one copy is then refused, or wrongly accepted, where the other is expected — a single source of truth. |

### declared-values-never-typed-again · MUST

A set of values the program declares is never typed out again. A subset is a named constant beside the set, and a schema over one of the program’s types derives its values from that type, or is checked against the type it produces.

| Why |
|---|
| a restated set drifts from its source, and a schema stricter or looser than its type locks out, or lets in, what the program does not mean — a single source of truth. |

### enumeration-others-read-declared-extensible · MUST

An enumeration another program reads is declared extensible. It is one the program writes into a contract another program reads — an answer, a message, a file — and its readers are told to expect values they do not know, save a set complete by its meaning — a sort direction, the days of the week — which stays closed.

| Why |
|---|
| a reader that fails on a new value breaks on the first one its writer adds, though nothing it relies on changed. |

### format-others-read-declared-in-a-schema · MUST

A format another program reads is declared in a schema a machine reads. This holds where its form has a schema language: the schema is kept in the repository, a spec checks what the program writes against it, and what the program writes carries only the fields the schema declares, never an object of its own serialised whole.

| Why |
|---|
| a format declared only in prose is read differently by each reader, a writer that drifts from it is found by a reader in production instead of by a spec, and an object sent whole sends every field later added to it to every reader. |

### unchecked-type-never-used · MUST

No code uses the type that switches the type checker off. No value, parameter, return or type argument has it, in specs too, and one the language infers as that type for lack of an annotation counts as well.

| Why |
|---|
| that type switches the checker off for everything it touches and spreads through every value that passes it on, so an error the checker would have caught reaches run time. |

## Invariants

### invariant-checked-at-construction · MUST

A value that must keep an invariant is built only through the function that checks it. That function is its checked constructor, **`<Type>.<create>`**{#checked-constructor} until its language's block names its form, so a value that exists is valid. A value with a starting transition is built instead only through it, its rebuild from storage and the functions that change it, each checking what it builds.

| Why |
|---|
| a value built around its check can exist invalid, so every caller must check it again, and the one that forgets passes it on — parse, don't validate. |

### invariant-value-is-plain-immutable-data · MUST

A value that keeps an invariant and is equal by its data is plain immutable data. It is compared by value and made of data alone, in its language's plain immutable record form, with no identity and no state that changes.

| Why |
|---|
| a value that can change breaks its invariant after its check, one with an identity counts two equal values as two, and one made of more than data loses the rest when it crosses a cache, a URL or storage — the value object pattern. |

### value-immutable-by-default · SHOULD

A value is immutable by default. A change makes a new value, and mutation stays local and deliberate.

| Why |
|---|
| a value that anyone holding it may change changes under the others who hold it, and each must trace them all to know what it holds. |

## Values from outside

### outside-value-untyped-until-parsed · MUST

A value from outside the program has no known type until it is parsed. Such values include text, a response, a file, a message, and what the program itself stored in an earlier run or version; a schema parses it or plain checks narrow it, in specs as in production, and no cast stands in for either. It is parsed once, where it enters, and trusted after.

| Why |
|---|
| a type written over unparsed data is a promise the data never made, and the first unexpected field breaks code far away — parse, don't validate. |

### narrowing-proves-all-it-claims · MUST

Code claims no type and no presence that a check did not prove. A narrowing that claims a type checks every property of it, as running the type’s whole schema does, and one that checks one field and claims the whole type is a cast. No cast or assertion claims a type or a presence no check proved.

| Why |
|---|
| code after a claim trusts every property it claims, so a narrowing that checks one field, or a cast or an assertion nothing checked, is a lie the type checker repeats, and the value breaks code far from the claim. |

### own-shape-strict-other-shape-tolerant · MUST

A shape the program owns is parsed strictly, and one another party owns and may extend is parsed tolerantly. Parsed strictly, an unknown key, a value of another type or a value outside an enumeration of a request it accepts fails; parsed tolerantly, a field the party adds is ignored.

| Why |
|---|
| a loose parse of the program's own shape lets in what the program does not know, and a strict parse of another party's breaks on the first field it adds — a tolerant reader. |

### outside-vocabulary-reached-through-a-total-table · MUST

A vocabulary another party owns is reached through a total table to the program's own values. Its words include the party's codes and its statuses; the type checker proves the table complete for every value the program knows, and a value it does not know, in a vocabulary its party may extend, maps to a member of the program's own for the unknown, which every branch names, and never fails the read.

| Why |
|---|
| without a total table, a value added to the program's copy of that vocabulary falls through to a default nobody chose, and a value the party adds fails the read. |

## Kinds of value

### absence-shown-by-the-type · MUST

Absence is spelled by one value and shown in the type. The value is **`<absent>`**{#absent} until the language block names it; no other value — an empty string, a minus one, a zero date — stands for it, and an empty collection is empty, not absent. Another spelling appears only where an outside format or an API the code calls imposes it.

| Why |
|---|
| two spellings of absence make every check ask twice, and a stand-in value passes for a real one. |

### instant-is-an-exact-time · MUST

An instant is an exact time, kept apart from a calendar date and a wall time. It is in UTC or carries its offset, and is written as text for another program as an RFC 3339 `date-time` with its offset. A calendar date and a wall time are types of their own; a time a person sets in a place — a meeting, a departure, an opening hour — is kept as its wall time with that place's IANA zone, and becomes an instant only when it is used; no time is read in the machine’s zone by default.

| Why |
|---|
| a time without its offset names a different moment on each machine, and a future time a person sets moves with its zone's rules, which only its wall time and its zone keep — RFC 3339. |

### duration-measured-on-a-monotonic-clock · MUST

A duration the program measures is read from a monotonic clock, never from the wall clock.

| Why |
|---|
| a wall clock that jumps (a correction, a change of season) corrupts every duration measured across the jump. |

### text-encoded-as-utf-8 · MUST

Text the program reads or writes is UTF-8, named explicitly. This holds for a file, a stream, a message: the encoding is named wherever a call takes one, never left to the platform's default, and an outside format that fixes another encoding is decoded where it enters and encoded where it leaves.

| Why |
|---|
| a default encoding differs between machines, so the same bytes read as different text in development and in production. |

### machine-text-independent-of-the-locale · MUST

Text written for another program is independent of the locale. Such text — a number, a date, a key, an identifier — is formatted, parsed, compared and cased independently of the locale the process runs in.

| Why |
|---|
| the same code writes `1,5` for one user and `1.5` for another, or upper-cases `i` to `İ`, and the reader on the other side refuses or misreads it. |

### exact-quantity-never-binary-float · MUST

Money and every other exact decimal quantity is never binary floating point. It is an integer of its smallest unit or a decimal type, with its currency or unit in the type.

| Why |
|---|
| binary floating point cannot hold 0.1 exactly, and a rounding error in money is a bug no review sees. |

## Data written as text

### mapping-key-unique · MUST

A key appears once in its mapping. The mapping may be an object, a table or a dictionary written as data.

| Why |
|---|
| most parsers keep the last value of a repeated key silently, so the first one reads as set while it does nothing. |

### string-holding-a-backslash-written-literally · MUST

A string written as data that holds a backslash is written in its format's literal form. Such strings include a regular expression and a Windows path; the literal form is the one that reads every backslash as itself, where the format has one.

| Why |
|---|
| a form that reads escapes turns `\b`, `\t` and `\n` into control characters and refuses the others, so the string changes its meaning with no error and still looks the same. |
