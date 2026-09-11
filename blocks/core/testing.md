# Testing

> Governs **what must be proven before a change is done, and how**. The concrete runner, matchers and coverage configuration are the `stack` chapter's; the rules here hold for every assembly.

---

## 1. Tests are part of the change
A unit ships with its tests in the same change. A pull request that adds behaviour without proof is incomplete. The coverage gate makes this mechanical: the test runner refuses a run below the threshold, and `check` runs the tests with the gate on.

---

## 2. Test inward-out
Most tests sit in the core: pure rules, no fakes needed. Adapters are tested against a fake of the outside system. Use-cases and orchestration are tested with fake ports. Entrypoints, commands and screens are tested last and thinly, through their public surface. **If the core isn't covered, the layering was paid for and not cashed in.**

---

## 3. Fakes over mocks
- A **fake** is a small in-memory implementation of a port: it behaves, records what it was asked, and can be primed with the state a scenario needs.
- Mocking frameworks, spies on internals and monkey-patching are not used by default. A test that needs one is a signal that the boundary is wrong: move the effect behind a port and fake the port.
- **Every effect has a fake:** file system, clock, network, process, randomness, environment. The module that hosts the primitive hosts its fake too.

---

## 4. No real world in tests
Tests never touch the network, a real file system outside a temporary sandbox, real time, real processes or real credentials. A test that calls a vendor API is not a test; it is a manual verification and lives outside `check`.

---

## 5. Placement and naming
- Tests live in a **`__tests__/` folder beside the code they prove**, one spec file per unit, named after it: `__tests__/<name>.spec.*`.
- Fakes and fixtures live in `__tests__/` too — `fake-<port>` for a fake, the fixture's own name otherwise — and are reachable **only from tests**: production code never imports from `__tests__/` (dependency-checker enforced).
- `describe` names the unit; each case reads `should <behaviour> when <condition>` and is built as §6 says.
- One intent per case. Strict equality over loose matchers. No snapshot of a structure a reader cannot verify by eye.

---

## 6. Arrange, Act, Assert
Every case is **three sections in this order, each opened by its own marker line, each present exactly once:**

- **Arrange** builds the scenario: the fakes, the fixtures, the inputs. It calls nothing under test and asserts nothing.
- **Act** calls the unit under test **once** and captures what came back — a value, a promise, a thunk. Nothing else happens there.
- **Assert** checks the outcome. No setup, no second call.

A section is never merged into another. A `beforeEach` that also acts, an expectation placed inside Act, a second Act after an Assert — each hides what the case proves. A case that wants a second Act is two cases. A failure is captured in Act and checked in Assert, so the two stay apart even then:

```ts
// Arrange
const document = buildDocument({ nodes: [] });

// Act
const run = (): PlatformDocument => parseDocument(document);

// Assert
expect(run).toThrow('at least one node');
```

---

## 7. Coverage
- The gate is **100 percent of functions and lines**, held by the runner's native threshold in its configuration file — never by a script parsing output.
- Test files, fakes, fixtures, the composition root and the entrypoint are excluded by an explicit list; nothing else is.
- The gate counts only files a test loaded. A module no test imports is invisible to it — reviewing that every unit has a spec is a human duty the gate does not replace.

---

## 8. What is not tested
Generated files, type-only modules and vendored configuration are outside the gate. A rule a tool already enforces is not re-tested in prose.
