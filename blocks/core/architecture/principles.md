# Principles

> The laws that hold for any program we build, in any language, of any kind. Every other chapter and block binds to them, and none loosens them. This chapter states principles and boundaries; the particulars follow from them.

## Philosophy

**High cohesion and low coupling are the goal.** Things that change together live together; things that change apart cannot reach into each other. Every law below serves this goal, and when two rules seem to conflict, the choice that raises cohesion and lowers coupling wins.

**Dependencies point toward stability.** Business rules are the most stable part of a system and depend on nothing volatile. Frameworks, transports, vendors and user interfaces are volatile; they depend on the rules, never the reverse.

**By symptom, not by speculation.** A structure, a pattern or a shared module appears when a present force demands it, never because it might help later. An internal abstraction waits for the third occurrence; one introduced earlier is a liability: the axis it guesses at is usually wrong, and a seam in the wrong place must be torn out before it can be fixed.

**A boundary is not a speculation.** Where the system meets something outside it — a vendor, an engine, a transport, a format, a clock — the seam is justified by the boundary itself, not by a second implementation. A port with one adapter is complete, not premature.

**A rule a tool can hold is held by the tool.** Prose carries only what no tool can express; a rule nobody checks is decoration.

**Where a business rule lives:** would it still be true if the program had no user interface and no transport at all? Then it belongs to the domain. Otherwise it belongs to the layer that owns the user interface or the transport.

## The laws

The laws are the only MUST rules of this chapter. Each one is binding in every project; a project lowers one only by an override written with the user's consent.

## dependencies-point-inward · MUST
Imports point inward, toward stability: an outer part imports an inner one, never the reverse.

| Why | Check | Tags |
|---|---|---|
| an outward import lets a volatile detail break a stable rule. | tool/imports | [] |

## inner-layers-declare-their-contracts · MUST
The inner layer declares, in its own words, the contracts it needs; the outer layer implements them. Both depend on the contract, never the inner layer on the implementation.

| Why | Check | Tags |
|---|---|---|
| the business rules then choose what they need, and a vendor or engine can be replaced without touching them. | review | [] |

## domain-imports-only-itself-and-kernel · MUST
The domain imports only itself, the shared kernel and the shared ports of `contracts/`: no framework, no input or output, no vendor library, however pure. A tool's types stop at its boundary; a validation engine conforms to the domain's types and never declares them.

| Why | Check | Tags |
|---|---|---|
| a domain that imports a library changes when the library does, and cannot be read or tested without it. | tool/imports | [] |

## one-reason-to-change → one-reason-per-unit
A layer and a module have one reason to change each, as every unit does.

| Why | Check | Tags |
|---|---|---|
| a layer or module with two reasons changes for both, and every change risks the other purpose. | review | [] |

## one-home-per-datum · MUST
Every datum and every piece of state lives in one place; everything else reads it or derives from it.

| Why | Check | Tags |
|---|---|---|
| two copies of one fact drift apart, and then the program is wrong in one of them. | review | [data] |

## features-blind-to-each-other · MUST
A feature never imports another feature. Features are combined only by the layer above them.

| Why | Check | Tags |
|---|---|---|
| a feature that knows another cannot change, be tested or be removed alone. | tool/imports | [] |

## access-only-through-curated-surface · MUST
A module is reached from outside only through its surface, and the surface is curated: it offers what a caller may couple to and nothing else. Its internals are private.

| Why | Check | Tags |
|---|---|---|
| whatever a module exposes, a caller eventually depends on, and every exposed detail becomes one the module can no longer change. | review | [] |

## surface-is-the-only-way-in → access-only-through-curated-surface
A module, a domain role folder and the kernel are reached from outside only through their surface.

| Why | Check | Tags |
|---|---|---|
| an import past the surface couples to an internal the module is free to change. | tool/imports | [] |

## external-shapes-mapped-at-boundary · MUST
An external shape — a response, a row, a message, a file format — is mapped to the inner model at the edge, in both directions. A wire shape never travels inward.

| Why | Check | Tags |
|---|---|---|
| a vendor's shape inside the domain turns every change of the vendor into a change of the business rules. | review | [data] |

## side-effects-at-the-edges · MUST
Input and output, network, storage, clock, randomness and processes live in adapters. The domain is free of effects.

| Why | Check | Tags |
|---|---|---|
| code without effects is deterministic, so it can be tested fast, reasoned about locally and reused. | review | [] |

## one-explicit-composition-root · MUST
Concrete implementations are chosen and wired in one known place, the composition root. A unit receives its dependencies, typed by their contracts, and never builds an adapter itself. No container magic.

| Why | Check | Tags |
|---|---|---|
| one place that names every concrete choice makes the program's shape readable and every choice replaceable, in production and in tests. | review | [] |

## reads-and-writes-apart · MUST
Where one operation reads and another writes, the read path and the write path never import each other, directly or through a surface that joins them.

| Why | Check | Tags |
|---|---|---|
| reads and writes change for different reasons and scale differently; kept apart, each can change without the other. | tool/imports | [] |

## code-lives-with-its-reason-to-change · MUST
Code lives in the layer that owns its reason to change, beside its consumer when they share that reason, and lifts to the nearest common level only when a second consumer appears. A tool is placed by the same rule. Business rules stay in the domain even with a single consumer: their reason to change is the business, not the caller.

| Why | Check | Tags |
|---|---|---|
| code placed by its reason to change is found where it is needed and moves only when that reason moves. | review | [] |

## contracts-shaped-by-role · MUST
A contract is shaped by the role that uses it: a reader sees only reads, a writer only writes, and no caller receives an operation it has no reason to call.

| Why | Check | Tags |
|---|---|---|
| a wide contract couples every caller to operations it never uses, and hides which caller can change what. | review | [] |

## untrusted-input-parsed-at-edge · MUST
Input from outside the program — a request, a response, a file, the environment — is parsed once, at the edge, into a known type. Inside, it is trusted and never checked again.

| Why | Check | Tags |
|---|---|---|
| a value parsed once cannot carry an unexpected shape into the domain, and the checks do not scatter through the code. | review | [security] |

## extension-by-addition · MUST
A new kind of thing — a vendor, a command, a format, a rule — is added as a new member and its registration, without editing the code that handles the other kinds. A long branch by kind becomes a strategy and a registry.

| Why | Check | Tags |
|---|---|---|
| code that grows by addition keeps every existing member untouched, so adding one cannot break another. | review | [] |

## The modelling vocabulary

- **Ubiquitous language.** Names match the business: `cancelOrder`, not `updateRecord`. The terms come from the people who own the domain and are mirrored, not translated; `PROJECT.md` keeps them in its glossary.
- **A feature is a bounded context.** One word may mean different things in two features.
- **Ports and adapters.** A port names what the domain needs, in the domain's words. An adapter implements it over one external system.
- **Entities, value objects, use-cases.** Business types with identity; small values that guard an invariant; the operations that carry business rules. Their form is the language's.
- **Domain events.** A domain event records, in the past tense, what happened, in the domain's words.

## duplication-across-contexts-by-default · SHOULD
Across bounded contexts, duplication is the default and sharing the exception. A context that needs another's entity keeps its own narrow view of it, such as a reference by identifier. The shared kernel stays small and holds only what is universal and stable.

| Why | Check | Tags |
|---|---|---|
| a type shared by two contexts must satisfy both, so every change to it is negotiated, and the contexts stop being able to change apart. | review | [] |

## entity-behaviour-beside-entity · SHOULD
What concerns one entity alone — a predicate, a derived value, a transition of state the program owns — is a pure function in that entity's file, never a method and never repeated in use-cases or screens; a use-case orchestrates entities and ports.

| Why | Check | Tags |
|---|---|---|
| a rule about one entity written once is changed once, and a screen asks the entity instead of repeating the check. | review | [] |
