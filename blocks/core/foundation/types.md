# Types

> How values are typed, parsed and kept, in any language; the language block gives the form.

## guard-proves-every-property-it-claims · MUST
A type guard checks every property of the type it claims, as running the type's whole schema does. A guard that checks one field — an identifier present, and the value called a user — and claims the whole type is a cast.

| Why | Check | Tags |
|---|---|---|
| code after the guard trusts every property, so a guard that checks one is a lie the type system repeats. | review | [] |

## outside-values-untyped-until-parsed · MUST
A value from outside the program — parsed text, a response body, a file, a message — has no known type until a schema parses it or plain checks narrow it, in specs as in production; no cast and no annotation stands in for either.

| Why | Check | Tags |
|---|---|---|
| a type written over unparsed data is a promise the data never made, and the first unexpected field breaks code far away. | review | [security] |

## identifiers-branded-by-entity · SHOULD
An entity's identifier is a type of its own, branded by its entity, so an order's identifier cannot be passed where a user's is expected.

| Why | Check | Tags |
|---|---|---|
| two identifiers of one primitive type are swapped silently; a brand makes the compiler refuse it. | review | [] |

## domain-values-never-typed-again → one-home-per-datum
A set of values the program declares for its business is never typed out again. A subset of an enum is a named constant beside the enum, and a schema over one of the program's types is checked by type against the value it produces. A vocabulary another party owns — an analytics report's, a wire format's — is not the program's: a total table maps the program's values to it, and the compiler checks the table.

| Why | Check | Tags |
|---|---|---|
| a restated set drifts from its source, and a schema that is stricter or looser than its type locks out, or lets in, what the program does not mean. | review | [] |

## invariant-values-are-plain-immutable-data → invariant-checked-at-construction · MUST
A value that keeps an invariant is immutable, compared by value, and made of data alone, in its language's plain immutable record form: it has no identity and no state that changes.

| Why | Check | Tags |
|---|---|---|
| data alone crosses a cache, a URL and storage as it is, two values with the same data are the same value, and a value no one can change keeps its invariant. | review | [data] |

## shapes-composed-of-small-shapes · SHOULD
A shared shape is composed of small named shapes — an identifier, timestamps, a page of results — never cut out of a large base type by omitting or picking its fields.

| Why | Check | Tags |
|---|---|---|
| a shape cut from a large one changes whenever the large one does, and hides which fields its consumer really needs. | review | [] |

## types-live-with-their-consumer · SHOULD
A type lives beside the unit whose signature introduces it, and every other unit imports it from there. It moves to its own file when a second consumer appears, and never gets a second home through a re-export.

| Why | Check | Tags |
|---|---|---|
| one home per type means one place to change it and no copy to drift. | review | [] |

## immutable-by-default · SHOULD
Values are immutable by default; a change makes a new value. Mutation is local and deliberate.

| Why | Check | Tags |
|---|---|---|
| a value no one can change can be shared and reasoned about without tracing who else holds it. | review | [] |

## documents-strict-vendor-answers-tolerant · MUST
A document the program owns is parsed strictly: an unknown key or a value of another type fails. An answer a vendor owns is parsed tolerantly: a field the vendor adds is ignored, not fatal.

| Why | Check | Tags |
|---|---|---|
| the program's own document must carry nothing the program does not know, while a vendor may add fields at any time. | review | [data] |

## no-any-type · MUST
No value, parameter, return or type argument has the type that switches the type checker off, in specs too; one the language reads as that type because it is left unannotated counts as well.

| Why | Check | Tags |
|---|---|---|
| that type switches the type checker off for everything it touches, and it spreads. | review | [] |

## instants-carry-their-zone · MUST
An instant carries its zone or offset, and is kept apart from a calendar date or a wall time, which carry none; no time value is read in the machine's zone by default.

| Why | Check | Tags |
|---|---|---|
| an instant without its zone names a different moment on each machine, and a default zone changes with the machine the program runs on. | review | [data] |
