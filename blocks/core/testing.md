# Testing

> How behaviour is proven. Tests prove what a caller observes at the program's boundaries; coverage and mutation measure them, and the check runs them on every change.

## Levels

- **Unit** — a boundary of the domain, with fakes of its ports. Run by the check.
- **Integration** — an adapter against its real engine inside a sandbox: a temporary folder, the real parser, a disposable container. A step of the check of its own.
- **End-to-end** — a critical scenario of `PROJECT.md`, through the delivery layer.
- **Evals** — the behaviour of a model, measured apart from the check.

## What a spec proves

## spec-per-boundary · SHOULD
A spec proves one boundary and is named after it. A boundary is what a caller outside its folder reaches: a use-case, a command, an adapter, a screen, a reusable component, a library primitive, a module of pure rules. What a boundary uses is proven through its spec; a helper gets a spec of its own only when its logic is worth cases of its own. Types, constants, schemas, composition, entry files, generated files and third-party code get no spec. Every boundary has a spec; a reviewer checks it, since the coverage gate cannot. How a screen and a component are proven is stated by the blocks of an interface.
**Why:** a spec per file mirrors the layout, not the behaviour: it breaks when a helper moves while the behaviour stays, and repeats what the boundary's spec already proves.
**Check:** review
**Tags:** testing

## constant-tested-only-as-contract · SHOULD
A constant gets a spec only when a reader outside the code relies on it — a code users script against, a name another system reads — and then as one table per contract.
**Why:** a spec that restates a constant passes as long as the file says what it says, catches nothing, and fails on every deliberate change.
**Check:** review
**Tags:** testing

## assert-what-a-caller-observes · SHOULD
A case checks an outcome a caller observes — a returned value, a changed state, what a user sees — and a call on a fake only when the call itself is the behaviour. Fakes over mocks; no verified mocks.
**Why:** a test of calls breaks when the implementation changes and the behaviour does not, and passes when the behaviour breaks behind the same calls.
**Check:** review
**Tags:** testing

## case-earns-its-place · SHOULD
A case earns its place by failing for a plausible bug no other case catches. A case that cannot fail — a restated constant, a check of the library or the framework, a duplicate — is deleted.
**Why:** a case that catches nothing costs reading, running and updating, and makes the suite look stronger than it is.
**Check:** review
**Tags:** testing

## one-intent-per-case · SHOULD
A case proves one intent and asserts it with strict equality on the whole outcome.
**Why:** a failing case then names one broken behaviour, and a partial assertion lets the rest of the outcome change unseen.
**Check:** review
**Tags:** testing

## variants-in-one-table · SHOULD
Variants of one behaviour are one table of cases, each row naming its condition.
**Why:** a table shows at a glance which conditions are covered and which are missing, and a new variant is one row.
**Check:** review
**Tags:** testing

## no-unreadable-snapshots · SHOULD
No snapshot of a structure a reader cannot check by eye. A generated format is compared with a golden file a reader can read.
**Why:** a snapshot nobody reads is accepted whatever it holds, so it proves only that the output did not change.
**Check:** review
**Tags:** testing

## every-declared-failure-has-a-case · SHOULD
Every failure a boundary declares has a case that produces it and checks what the caller receives.
**Why:** a failure path is the code least exercised by use, so it is the first to break unnoticed.
**Check:** review
**Tags:** testing, errors

## edge-cases-by-risk · SHOULD
Edge cases are chosen by risk: empty input, limits, Unicode, invalid input, a concurrent call, a lost connection.
**Why:** bugs live at the edges, and choosing them by risk spends cases where a bug is likely.
**Check:** review
**Tags:** testing

## property-tests-where-they-pay · SHOULD
An invariant is proven by a property test where one pays — a value object's guard, an invertible mapper, a reducer — with its cases in the spec of its unit.
**Why:** a property test tries inputs no author thought of, where a few examples would miss the one that breaks.
**Check:** review
**Tags:** testing

## lifecycle-tested-to-final-state · SHOULD
A lifecycle test takes an object made by its factory through every transition to its final state, and checks each step.
**Why:** each transition may pass alone while their sequence breaks; only the whole path proves the object's life.
**Check:** review
**Tags:** testing

## one-contract-suite-per-port · SHOULD
Each port has one contract suite, run against its fake and against its real adapter.
**Why:** a fake that behaves unlike the real adapter makes every test that uses it prove the wrong thing.
**Check:** review
**Tags:** testing

## Practices

## tests-ship-with-the-behaviour · MUST
Tests ship in the same change as the behaviour they prove. A change of behaviour updates its spec in the same change.
**Why:** a behaviour merged without its test is a behaviour nobody will test later.
**Check:** review
**Tags:** testing

## test-seen-failing · SHOULD
Every test has been seen failing for the right reason: written before the code, or after it with the code broken for a moment.
**Why:** a test never seen failing may test nothing.
**Check:** review
**Tags:** testing

## bug-fix-starts-with-failing-test · SHOULD
A bug fix begins with the test that reproduces the bug, seen failing before the fix.
**Why:** the test proves the fix fixes this bug, and keeps it from coming back.
**Check:** review
**Tags:** testing

## tests-first-from-a-description · SHOULD
When a behaviour is described before it is built — in an issue or a plan — an agent writes its tests from the description first. A person may write the code first.
**Why:** tests written from the description prove what was asked, not what was built.
**Check:** review
**Tags:** testing

## The sandbox

## tests-run-in-a-sandbox · MUST
Tests touch no network, no real file system outside a temporary folder, no real clock, no process they did not start and no credential. The repository's own files are read-only fixtures. A real vendor is exercised only by a person.
**Why:** a test that reaches the world is slow, flaky and can do real harm; a sandboxed one gives the same answer every run.
**Check:** review
**Tags:** testing, security

## effects-faked-through-ports · SHOULD
Network, time, randomness, processes and credentials are faked through their ports, with one fake per port, named `<port>.fake`.
**Why:** a fake behind the same port as the real effect replaces it without touching the code under test.
**Check:** review
**Tags:** testing

## adapter-integration-tested-in-sandbox · SHOULD
Each adapter is proven against its real engine inside the sandbox, in `<name>.integration.spec`, with a case for each port operation and each failure it maps. A remote vendor that cannot run in a sandbox is proven through its transport with captured responses. An integration spec counts toward the coverage gate only for an engine the project owns.
**Why:** a fake proves the domain; only the real engine proves the mapping to it.
**Check:** review
**Tags:** testing

## end-to-end-per-critical-scenario · SHOULD
Each critical scenario `PROJECT.md` names has one end-to-end test through the delivery layer, in `tests/e2e/<name>.e2e.spec` beside `src/`; `tests/` holds one folder per kind of suite that drives the built program.
**Why:** the scenarios that must never break are proven the way users meet them, and no more end-to-end tests are paid for than that.
**Check:** review
**Tags:** testing

## Files and names

## test-files-named-by-role · MUST
A file in `__tests__/` or in `tests/` is a spec named after the file or scenario it proves — `<name>.spec`, `<name>.integration.spec`, `<name>.e2e.spec` — a fake `<port>.fake`, or fixtures `<name>.fixtures`, and nothing else; the language fixes the spelling. A spec carries its file's role suffix, so a double suffix appears only in tests.
**Why:** a spec named otherwise would not run, and a helper named like a spec would.
**Check:** tool — names
**Tags:** testing, naming

## test-code-unreachable-from-production · MUST
Production code never imports a file of `__tests__/` or of `tests/`.
**Why:** a fake or a fixture in production code ships test behaviour to users.
**Check:** tool — architecture
**Tags:** testing, architecture

## cases-named-should-when · SHOULD
A suite is named after its boundary, and a case reads `should <behaviour> when <condition>`, in the language's spelling.
**Why:** a failing case then says which behaviour broke and under what condition, without opening it.
**Check:** tool — lint
**Tags:** testing, naming

## arrange-act-assert-marked · SHOULD
A case has three parts — Arrange, Act, Assert — each marked and present once, and Act makes one call.
**Why:** a reader sees at once what is set up, what is done and what is proven.
**Check:** review
**Tags:** testing

## no-skipped-or-empty-tests · MUST
No test is skipped, pending, focused or without an assertion.
**Why:** a skipped test looks like coverage and proves nothing, and a focused one silently skips all the others.
**Check:** tool — lint
**Tags:** testing

## The gates

## tests-pass-in-check · MUST
The project's check runs the tests, and fails when one fails.
**Why:** a test that runs only when someone remembers protects nothing.
**Check:** tool — tests
**Tags:** testing

## coverage-holds-all-logic · MUST
All logic — the domain, the adapters, the libraries, the UI — is held at 100 percent of lines and functions, and of branches where the runner measures them, reached only through the tests of its boundaries. Excluded: the entry, an entrypoint's entry file, the wiring file, generated files, declarations and vendored code. A line no behaviour reaches is a missing behaviour test, or code nothing needs, which is deleted; never a reason for a test of its own.
**Why:** tests of behaviour at the boundaries reach every line a caller can reach, so the gate costs nothing extra and catches dead code and a missing behaviour test.
**Check:** tool — coverage
**Tags:** testing

## mutants-all-killed · MUST
Mutation testing measures the tests, and every mutant of the logic is killed. A mutant no behaviour can tell apart is marked in the code, with its reason, as equivalent; any other survivor fails the check. It runs in the check over the files a change touches and the files whose specs it touches, reusing earlier results.
**Why:** a suite that lets mutants live is weaker than its coverage says, and a mutant in code no test runs also holds every line to a test.
**Check:** tool — mutation
**Tags:** testing
