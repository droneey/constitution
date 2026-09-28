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
| a swallowed error turns a failure into wrong data that shows up far from its cause, and a message is text a person may reword. | tool — lint | [errors] |

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

## value-objects-guard-their-invariant · SHOULD
A value that must keep an invariant is built only through the function that checks it, so a value that exists is valid.

| Why | Check | Tags |
|---|---|---|
| when the invariant is checked at construction, no caller has to check it again or can forget to. | review | [] |
