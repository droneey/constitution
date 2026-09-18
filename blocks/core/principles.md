# Principles

> The laws that hold for any software we build, in any language, of any kind. Every sphere, framework and stack binds to them; none may loosen them. This chapter states **principles and boundaries**, not micro-instructions — particulars are *derived* from the principles, not enumerated.

---

## 0. Philosophy

**The overriding goal is high cohesion and low coupling.** Things that change together live together; things that change apart cannot reach into each other. Every law below serves this goal, and when two rules seem to conflict, the tie-breaker is whichever choice raises cohesion and lowers coupling.

**Dependencies point inward, toward stability.** Business rules are the most stable thing in a system and depend on nothing volatile. Frameworks, transports, vendors and user interfaces are volatile and depend on the rules — never the reverse.

**By symptom, not by speculation.** A structure, an abstraction, a pattern or a shared module appears when a concrete, present force demands it — never because it might help later. An abstraction introduced before its second real use is a liability, not foresight.

**A rule a tool can hold is held by the tool.** Prose carries only what no tool can express. An un-enforced rule is decoration.

The test for *where a business rule lives*: **would it still be true if the application had no user interface and no transport at all?** Yes → the core. No → the layer that owns the interface or the transport.

---

## 1. The Laws (non-negotiable)

1. **Directional & acyclic dependencies.** Imports point inward toward stability. No cycles.
2. **Dependency inversion.** The inner layer declares the contracts it needs; the outer layer implements them. Both depend on the abstraction.
3. **Purity of the core.** The core imports only itself and the shared kernel. No framework, no IO, no vendor library.
4. **Single responsibility.** Each layer, module and unit has one reason to change.
5. **Single source of truth.** Every datum and every piece of state lives in one place; everything else reads it.
6. **Feature isolation, composition above.** A feature never imports another feature's internals. Features are combined only by the layer above them.
7. **Public API / encapsulation.** Cross-module access goes through the module's public surface; internals are private. A public surface is **curated, not a mirror**: it exposes what consumers may couple to and nothing else.
8. **Anti-corruption at every boundary.** External shapes are mapped to the inner model at the edge, in both directions. A wire shape never travels inward.
9. **Side effects at the edges.** IO, network, storage, clock, randomness and processes live in adapters; the core is effect-free.
10. **Explicit composition root.** Concrete implementations are wired in one known place. No container magic.
11. **Reads and writes are separated.** Where one operation reads and another writes, the read path and the write path never import each other.
12. **Co-location by reason to change.** Code lives in the layer that owns its reason to change, beside its consumer when they share that reason. It lifts to the nearest common level only when a second consumer appears. Business rules stay in the core even with a single consumer — their reason to change is the business, not the caller.
13. **Illegal states are unrepresentable.** A value with distinct stages is a discriminated union keyed by its state, not a bag of optionals and boolean flags.
14. **Errors are surfaced, never swallowed.** A caught error is handled, rethrown or mapped to a typed error. Code branches on a typed error or its code, never on message text.
15. **Mechanical enforcement.** Every law expressible as a dependency rule lives in the dependency checker and fails the check.

---

## 2. Tools

- **Name the concern, not the brand.** A chapter refers to a tool by what it *does* — the data layer, the validation engine, the test runner. Only a stack chapter resolves concern → brand. Swapping a tool is then a stack edit plus one wrapper, never a sweep through the rules.
- **A tool never defines the shape of a layer it doesn't belong to.** Its types stop at its boundary: a transport SDK's shapes die in the adapter, a cache engine's types never reach the core, a validation engine *conforms to* the core's types and never declares them. This is dependency inversion and anti-corruption (Laws 2, 8) applied to libraries.
- **A tool is placed by the same laws as any other code:** in the layer whose reason to change it shares, reached only through that layer's boundary.

---

## 3. Modelling vocabulary

- **Ubiquitous Language.** Names match the business: `cancelOrder`, not `updateRecord`. Terms come from the people who own the domain and are mirrored, not translated.
- **A feature is a bounded context.** The same word may mean different things in different features. Across contexts, **duplication is the default and sharing the exception**; a shared kernel stays small and holds only the genuinely universal and stable.
- **Ports and adapters.** A port names what the core needs, in the core's own words. An adapter implements it over one external system — **one adapter per system, never per method.**
- **Entities, value objects, use-cases.** Data shapes with identity; small values with a guarded invariant; the operations that carry business rules. Their concrete form is decided by the language and the sphere.

---

## 4. Clean code

Code documents itself through names and structure; comments are the rare exception, not the medium.

- **Naming carries the meaning.** No abbreviations that aren't already domain terms.
- **Small, single-purpose units.** A function does one thing at one level of abstraction. If it needs a comment to mark "section two", it's two functions.
- **Fail fast, nest little.** Remove the failure paths first with guard clauses; the happy path stays at the top indentation level. A genuine hierarchy — a parser, a tree walk — is the exception, not the habit.
- **Pure by default.** Output depends only on input. Side effects live where the laws put them, never buried in an otherwise-pure helper.
- **Comments explain *why*, never *what*.** A comment states a constraint, a workaround or a counter-intuitive decision. A comment narrating the next line is forbidden. Commented-out code is forbidden — history lives in version control.
- **No dead code.** No unused exports, parameters, variables or branches. Delete; don't keep for later.
- **Readability over cleverness.** A longer obvious form beats a terse obscure one.
- **Composition over inheritance.** Behaviour is composed from small units. Inheritance couples a child to a parent's internals and resists change.
- **Patterns by need, never pre-emptively.** A design pattern answers a concrete, present problem. Extract on the third occurrence, not the first.
- **Named arguments past one parameter.** A unit taking more than one argument takes a single options object, so every call site is self-describing and parameters can be added without touching callers. A genuine single-value transform stays positional, and so does a **symmetric binary operation** — a reducer, comparator or combiner whose argument order is itself the convention.

---

## 5. Layout

Folders carry meaning of their own. A reader who opens one must be able to say what it is for, and a
file must have exactly one folder it could belong to.

- **A folder is named for its purpose and holds one purpose.** Say what it is for in one phrase: if
  the phrase needs "and", it is two folders. Name it for what its contents are *for*, never for what
  they are made of — a folder named after a technical shape (`types`, `helpers`, `classes`) tells a
  reader nothing about the system.
- **A set owns its folder.** Where files are of one kind and arrive one at a time — one per vendor,
  per command, per rule, per section — they live together in a folder named for the member in the
  plural, and nothing else lives there. Adding the next member is then adding a file, and no one has
  to tell members from machinery by reading their names.
- **What is *about* a set sits beside that folder, never inside it:** the contract its members
  satisfy, the registry that indexes them, the operation that runs them all. The members are plural
  and repeat; these are singular and do not.
- **The surface file of a folder** — the file the language resolves when the folder itself is
  imported — carries re-exports and nothing else: no declaration, no table, no function. It is a
  door, not a room. A file never imports the surface of its own folder; that is where import cycles
  begin.
- **Depth by need.** A folder appears to separate purposes that are already mixed, never in
  anticipation of members that do not exist yet. One member is reason enough when the alternative is
  leaving it among the things that describe it.

---

## 6. Definition of done

- [ ] The change lives in the layer that owns its reason to change; every import points inward
- [ ] Nothing volatile reached the core; every external shape was mapped at the edge
- [ ] Every state has one home; every failure is typed and surfaced
- [ ] The public surface exposes only what a consumer may couple to
- [ ] Every folder holds one purpose; each set sits in a folder of its own and every surface file only re-exports
- [ ] The tool-enforced checks pass; the rules no tool holds were reviewed against the chapters that govern the change
