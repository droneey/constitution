# Code

## Naming

The case of source file names belongs to the language block; every other file is kebab-case.

## domain-names-free-of-vendor-and-storage · SHOULD
A domain name names the concept, never the vendor or the storage behind it: `UserRecord`, not `UserMongoDocument`.
**Why:** a vendor in a domain name must be renamed everywhere when the vendor changes, and leaks it into code that should not know it.
**Check:** review
**Tags:** naming

## Units

## deep-modules-no-pass-through · SHOULD
A module hides much behind a small interface. A layer that only passes a call through is removed.
**Why:** a pass-through adds a place to read and change without hiding anything.
**Check:** review
**Tags:** architecture

## pure-by-default · SHOULD
A function's output depends only on its input. Effects live where the laws put them, never inside an otherwise pure helper.
**Why:** a pure function can be understood, tested and moved on its own.
**Check:** review
**Tags:** architecture

## Comments and leftovers

## no-debug-output-in-shipped-code · SHOULD
Shipped code writes no debug output and stops at no breakpoint; diagnostics go through the logging port. The output of a command-line program is its interface, not debug.
**Why:** stray output is noise to users and can leak what it prints.
**Check:** tool — lint
**Tags:** workflow, security

## Absence

## absence-has-one-value-normalised-at-boundary · MUST
Internal code spells absence with one value, which the language block names. The other spellings live only in wire types and at the boundary, which maps them to it.
**Why:** two spellings of absence make every check ask twice, and one of them is always forgotten.
**Check:** tool — lint
**Tags:** types, data

## Failure

## expected-failures-typed-with-codes · SHOULD
An expected failure is typed, carries a stable code `<MODULE>_<ENTITY>_<KIND>` and details that say what to do, and belongs to the contract that can fail. Universal failures live in `kernel/errors`, a feature's in its `domain/errors`, and adapters map transport failures to them; nothing raw passes a boundary.
**Why:** a caller that branches on a typed code keeps working when the message is reworded, and a failure that is part of the contract is handled by design.
**Check:** review
**Tags:** errors

## one-error-handler-per-transport · SHOULD
Defects travel to the boundary. Each transport has one handler that turns a failure into what its user sees: what happened and what to do next, never a stack trace or internals. A program exits only there.
**Why:** one handler gives every failure the same shape and the same next step, and no internal detail leaks.
**Check:** review
**Tags:** errors, security, ux

## Types

## schema-derives-from-domain-types · MUST
A schema over a domain type or enum derives its values from it and is checked by type against what it produces. A subset of an enum is a named constant beside the enum, never a list typed out again.
**Why:** a schema that restates the domain drifts from it, and a stricter or looser schema locks out, or lets in, what the domain does not mean.
**Check:** tool — types
**Tags:** types

## Effects

## effects-reached-through-ports · SHOULD
Clock, randomness, identifiers and the environment are reached through ports, never called directly from the logic.
**Why:** logic that reads the clock or draws a random number cannot be tested deterministically.
**Check:** review
**Tags:** architecture, testing

## environment-read-once-at-boot · SHOULD
One place reads the environment: `root/`, or the configuration provider a lower block names. Configuration is parsed once, at boot, into a typed value the rest of the program receives.
**Why:** a missing or malformed setting fails at start, not in the middle of a request, and no module depends on the process's environment.
**Check:** review
**Tags:** security, architecture

## Patterns and design

## canonical-patterns-by-need · SHOULD
A pattern answers a present problem, and then the canonical one: strategy plus registry for vendors and kinds, factory or module object for adapters, decorator at the composition root, reducer for transitions, transition table for state machines, builder for test data.
**Why:** one known pattern per problem is recognised at a glance; an invented one, or one used in advance, must be learned and maintained.
**Check:** review
**Tags:** architecture

## dry-applies-to-knowledge · SHOULD
Don't-repeat-yourself applies to knowledge, not to text that merely looks alike. Placement lifts shared code on the second consumer; an abstraction waits for the third occurrence.
**Why:** two copies of one fact drift, but two similar pieces with different reasons to change are coupled wrongly by one abstraction.
**Check:** review
**Tags:** architecture
