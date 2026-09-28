# Principles

## The laws

The laws are the only MUST rules of this chapter. Each one is binding in every project; a project lowers one only by an override written with the user's consent.

## illegal-states-unrepresentable · MUST
A value with distinct stages is a union keyed by its state, not a bag of optional fields and flags that allows combinations no stage has.

| Why | Check | Tags |
|---|---|---|
| a state the type cannot express is a state no code has to handle, and no test has to find. | review | [] |

## errors-surfaced-never-swallowed · MUST
A caught error is handled, rethrown, or mapped to a typed error. Code branches on an error's type or code, never on its message.

| Why | Check | Tags |
|---|---|---|
| a swallowed error turns a failure into wrong data that surfaces far from its cause, and a message is text a person may reword. | tool — lint | [errors] |

## rules-held-by-tools · MUST
Every rule whose Check names a role is held by a tool of that role in the project's check, configured to fail on a violation. A rule no configured tool holds is reviewed, or lowered by an override.

| Why | Check | Tags |
|---|---|---|
| a rule held only by prose is broken as soon as nobody reads it, and a tool never tires. | review | [] |

## one-reason-per-unit · MUST
Each unit — a function, a class, a file — has one reason to change.

| Why | Check | Tags |
|---|---|---|
| a unit with two reasons changes for both, and every change risks the other purpose. | review | [] |

## numbers-in-text-from-data · MUST
A number shown in a text — a count, a total, a limit — is read from the data it describes, never typed again.

| Why | Check | Tags |
|---|---|---|
| a number typed twice drifts from its source, and the text then states something the program no longer does. | review | [data] |

## The modelling vocabulary

- **Ubiquitous language.** Names match the business: `cancelOrder`, not `updateRecord`. The terms come from the people who own the domain and are mirrored, not translated; `PROJECT.md` keeps them in its glossary.
- **A feature is a bounded context.** One word may mean different things in two features.
- **Ports and adapters.** A port names what the domain needs, in the domain's words. An adapter implements it over one external system.
- **Entities, value objects, use-cases.** Business types with identity; small values that guard an invariant; the operations that carry business rules. Their form is the language's.
- **Aggregates and domain events** where the program owns the data it changes: an aggregate is the unit a change keeps consistent, reached through its root; a domain event records, in the past tense, what the domain decided.

## value-objects-guard-their-invariant · SHOULD
A value object is built only through the function that checks its invariant, so a value that exists is valid.

| Why | Check | Tags |
|---|---|---|
| when the invariant is checked at construction, no caller has to check it again or can forget to. | review | [] |
