# Testing

> How behaviour is proven. Tests prove what a caller observes at the program's boundaries; coverage and mutation measure them, and the check runs them on every change.

## Levels

- **Unit** — one boundary, with fakes of the contracts through which it reaches the outside. Run by the check.
- **Integration** — the code that talks to an external system, against its real engine inside a sandbox: a temporary folder, the real parser, a disposable container. A step of the check of its own.
- **End-to-end** — a critical scenario of `PROJECT.md`, through the built program, the way its users reach it.
- **Evals** — the behaviour of a model, measured apart from the check.

## What a spec proves

## spec-per-boundary · SHOULD
A spec proves one boundary and is named after it. A boundary is a unit a caller relies on, reached through its public entry. What a boundary uses is proven through its spec; a helper gets a spec of its own only when its logic is worth cases of its own. Types, constants, schemas, entry files, generated files and third-party code get no spec. Every boundary has a spec; a reviewer checks it, since the coverage gate cannot.

| Why | Check | Tags |
|---|---|---|
| a spec per file mirrors the layout, not the behaviour: it breaks when a helper moves while the behaviour stays, and repeats what the boundary's spec already proves. | review | [testing] |

## constant-tested-only-as-contract · SHOULD
A constant gets a spec only when a reader outside the code relies on it — a code users script against, a name another system reads — and then as one table per contract.

| Why | Check | Tags |
|---|---|---|
| a spec that restates a constant passes as long as the file says what it says, catches nothing, and fails on every deliberate change. | review | [testing] |

## assert-what-a-caller-observes · SHOULD
A case checks an outcome a caller observes — a returned value, a changed state, what a user sees — and a call on a fake only when the call itself is the behaviour. Fakes over mocks; no verified mocks.

| Why | Check | Tags |
|---|---|---|
| a test of calls breaks when the implementation changes and the behaviour does not, and passes when the behaviour breaks behind the same calls. | review | [testing] |

## case-earns-its-place · SHOULD
A case earns its place by failing for a plausible bug no other case catches. A case that cannot fail — a restated constant, a check of the library or the framework, a duplicate — is deleted.

| Why | Check | Tags |
|---|---|---|
| a case that catches nothing costs reading, running and updating, and makes the suite look stronger than it is. | review | [testing] |

## one-intent-per-case · SHOULD
A case proves one intent and asserts it with strict equality on the whole outcome.

| Why | Check | Tags |
|---|---|---|
| a failing case then names one broken behaviour, and a partial assertion lets the rest of the outcome change unseen. | review | [testing] |

## variants-in-one-table · SHOULD
Variants of one behaviour are one table of cases, each row naming its condition.

| Why | Check | Tags |
|---|---|---|
| a table shows at a glance which conditions are covered and which are missing, and a new variant is one row. | review | [testing] |

## no-logic-in-cases · SHOULD
A case holds no branch, loop or computed expectation; an expected value is written as a literal.

| Why | Check | Tags |
|---|---|---|
| logic in a case can be as wrong as the code it checks, and a reader must run it in their head to know what the case expects. | review | [testing] |

## fixtures-build-valid-defaults · SHOULD
A fixture is a factory that returns a valid value and takes overrides; a case overrides only the fields its condition is about.

| Why | Check | Tags |
|---|---|---|
| a case that states only what it is about shows its cause next to its effect, and a new required field changes one factory, not every case. | review | [testing] |

## no-unreadable-snapshots · SHOULD
No snapshot of a structure a reader cannot check by eye. A generated format is compared with a golden file a reader can read.

| Why | Check | Tags |
|---|---|---|
| a snapshot nobody reads is accepted whatever it holds, so it proves only that the output did not change. | review | [testing] |

## every-declared-failure-has-a-case · SHOULD
Every failure a boundary declares has a case that produces it and checks what the caller receives.

| Why | Check | Tags |
|---|---|---|
| a failure path is the code least exercised by use, so it is the first to break unnoticed. | review | [testing, errors] |

## edge-cases-by-risk · SHOULD
Edge cases are chosen by risk: empty input, limits, Unicode, invalid input, a concurrent call, a lost connection.

| Why | Check | Tags |
|---|---|---|
| bugs live at the edges, and choosing them by risk spends cases where a bug is likely. | review | [testing] |

## property-tests-where-they-pay · SHOULD
An invariant is proven by a property test where one pays — the guard of a value with an invariant, an invertible mapper, a reducer — with its cases in the spec of its unit.

| Why | Check | Tags |
|---|---|---|
| a property test tries inputs no author thought of, where a few examples would miss the one that breaks. | review | [testing] |

## property-counterexample-kept-as-case → property-tests-where-they-pay
A counterexample a property test finds becomes a row of the unit's table of cases.

| Why | Check | Tags |
|---|---|---|
| a property test draws new inputs each run, so only a row keeps the input that broke the code from coming back unseen. | review | [testing] |

## lifecycle-tested-to-final-state · SHOULD
A lifecycle test takes an object made by its factory through every transition to its final state, and checks each step. The path is one intent, so its steps are checked in one case.

| Why | Check | Tags |
|---|---|---|
| each transition may pass alone while their sequence breaks; only the whole path proves the object's life. | review | [testing] |

## one-contract-suite-per-contract · SHOULD
Each contract with a fake has one contract suite, run against the fake and against its real implementation.

| Why | Check | Tags |
|---|---|---|
| a fake that behaves unlike the real implementation makes every test that uses it prove the wrong thing. | review | [testing] |

## Practices

## tests-ship-with-the-behaviour · MUST
Tests ship in the same change as the behaviour they prove. A change of behaviour updates its spec in the same change.

| Why | Check | Tags |
|---|---|---|
| a behaviour merged without its test is a behaviour nobody will test later. | review | [testing] |

## test-seen-failing · SHOULD
Every test has been seen failing for the right reason: written before the code, or after it with the code broken for a moment.

| Why | Check | Tags |
|---|---|---|
| a test never seen failing may test nothing. | review | [testing] |

## flaky-test-fixed-or-removed · SHOULD
A test that passes and fails on the same code is fixed or deleted in the next change; no retry, repeat or rerun hides it.

| Why | Check | Tags |
|---|---|---|
| a retried test hides the race it found, and a suite that fails at random teaches everyone to rerun instead of reading the failure. | review | [testing] |

## specs-independent-of-order · SHOULD
A case passes alone and in any order; no state survives from one case or one file to the next.

| Why | Check | Tags |
|---|---|---|
| a case that leans on another passes or fails by the order the runner picks, and fails alone when someone runs it to find a bug. | review | [testing] |

## case-order-shuffled-with-a-seed → specs-independent-of-order
Every run of the specs shuffles the order of the cases and prints the seed that replays it; only a mutation tool's run of a single mutant keeps one order.

| Why | Check | Tags |
|---|---|---|
| a case that leans on another fails in some order, and the seed lets anyone run that order again; a mutant's run must stop at the same failing case whichever mutant it tests. | review | [] |

## no-fixed-sleeps-in-tests · SHOULD
A test waits for a condition or advances a fake clock, never a fixed delay.

| Why | Check | Tags |
|---|---|---|
| a fixed delay is too short on a slow machine and wasted on a fast one, so the test is both flaky and slow. | review | [testing] |

## unit-case-runs-in-milliseconds · SHOULD
A unit case finishes in milliseconds; a slower case reaches something outside its boundary and is an integration spec.

| Why | Check | Tags |
|---|---|---|
| the unit suite runs on every change, and it is run often only while it is fast. | review | [testing] |

## The sandbox

## tests-run-in-a-sandbox · MUST
Tests touch no network, no real file system outside a temporary folder, no real clock, no process they did not start and no credential. The repository's own files are read-only fixtures. A real vendor is exercised only by a person, or outside the check.

| Why | Check | Tags |
|---|---|---|
| a test that reaches the world is slow, flaky and can do real harm; a sandboxed one gives the same answer every run. | review | [testing, security] |

## network-refused-in-the-unit-run → tests-run-in-a-sandbox
The unit run replaces every call that opens a connection with one that throws, set once for all its specs; the integration run keeps the real calls.

| Why | Check | Tags |
|---|---|---|
| a spec that reaches a server by mistake passes while the server answers and fails at random when it does not; refused at once, it fails where the mistake is. | review | [] |

## one-fake-per-contract · SHOULD
Each faked contract has one fake, `<contract>.fake`, shared by every spec that needs it.

| Why | Check | Tags |
|---|---|---|
| one fake per contract is kept in step with its real implementation once, not once per spec that writes its own. | review | [testing] |

## effects-faked-never-mocked → one-fake-per-contract
No spec mocks, patches or spies on a module of the program: an effect is replaced by the fake of its contract.

| Why | Check | Tags |
|---|---|---|
| a mocked module replaces code the spec claims to test, and breaks when the module moves. | review | [] |

## integration-tested-against-the-real-engine · SHOULD
Each implementation of a contract over an external system whose engine can run inside the sandbox is proven against that engine there, in `<name>.integration.test`, with a case for each operation of the contract and each failure it maps. An integration spec counts toward the coverage gate only for an engine the project owns.

| Why | Check | Tags |
|---|---|---|
| a fake proves the code that relies on the contract; only the real engine proves that the implementation keeps it. | review | [testing] |

## integration-specs-in-their-own-run → integration-tested-against-the-real-engine
The unit run leaves the integration specs out, and they run as their own entry of the check.

| Why | Check | Tags |
|---|---|---|
| the fast run stays fast, and the slower integration run fails on its own. | review | [] |

## end-to-end-per-critical-scenario · SHOULD
Each critical scenario `PROJECT.md` names has one end-to-end test through the built program, the way its users reach it, in `tests/e2e/<name>.e2e.test` beside `src/`; `tests/` holds one folder per kind of suite that drives the built program.

| Why | Check | Tags |
|---|---|---|
| the scenarios that must never break are proven the way users meet them, and no more end-to-end tests are paid for than that. | review | [testing] |

## Files and names

## test-files-named-by-role · MUST
A file in `__tests__/` or in `tests/` is a spec named after the file or scenario it proves — `<name>.test`, `<name>.integration.test`, `<name>.e2e.test` — a fake `<contract>.fake`, or fixtures `<name>.fixtures`, and nothing else; the language fixes the spelling.

| Why | Check | Tags |
|---|---|---|
| a spec named otherwise would not run, and a helper named like a spec would. | review | [testing] |

## cases-named-should-when · SHOULD
A suite is named after its boundary, and a case reads `should <behaviour>`, with `when <condition>` where the behaviour depends on one, in the language's spelling.

| Why | Check | Tags |
|---|---|---|
| a failing case then says which behaviour broke and under what condition, without opening it; a condition invented to fill the pattern says nothing. | review | [testing] |

## case-reads-should-when → cases-named-should-when
A case reads `should <behaviour>`, and `when <condition>` follows where it has one.

| Why | Check | Tags |
|---|---|---|
| a failing case then names what broke and under what condition. | tool/lint | [testing] |

## no-branch-or-loop-in-a-case → no-logic-in-cases
A case's body holds no branch, loop or conditional expression.

| Why | Check | Tags |
|---|---|---|
| a branch in a case runs one path and skips the other, so the case may assert nothing on the path it took. | tool/lint | [testing] |

## arrange-act-assert-marked · SHOULD
A case has three parts — Arrange, Act, Assert — each marked and present once, and Act makes one call.

| Why | Check | Tags |
|---|---|---|
| a reader sees at once what is set up, what is done and what is proven. | review | [testing] |

## no-skipped-or-empty-tests · MUST
No test is skipped, pending, focused, run only under a condition, expected to fail, or without an assertion.

| Why | Check | Tags |
|---|---|---|
| a skipped test looks like coverage and proves nothing, and a focused one silently skips all the others. | tool/lint | [testing] |

## test-code-unreachable-from-production · MUST
Production code never imports a file of `__tests__/` or of `tests/`.

| Why | Check | Tags |
|---|---|---|
| a fake or a fixture in production code ships test behaviour to users. | tool/imports | [testing] |

## The gates

## tests-pass-in-check · MUST
The project's check runs the tests, and fails when one fails.

| Why | Check | Tags |
|---|---|---|
| a test that runs only when someone remembers protects nothing. | tool/tests | [testing] |

## coverage-holds-all-logic · MUST
All logic — the program's own rules, the code that talks to external systems, the libraries, the user interface — is held at 100 percent of lines and functions, and of branches where the runner measures them, reached only through the tests of its boundaries. Excluded: the entry file of each artifact, the file that wires the program together, generated files, declarations and vendored code. A line no behaviour reaches is a missing behaviour test, or code nothing needs, which is deleted; never a reason for a test of its own.

| Why | Check | Tags |
|---|---|---|
| tests of behaviour at the boundaries reach every line a caller can reach, so the gate costs nothing extra and catches dead code and a missing behaviour test. | review | [testing] |

## mutants-all-killed · MUST
Mutation testing measures the tests, and every mutant of the logic is killed. A mutant no behaviour can tell apart is marked in the code, with its reason, as equivalent; any other survivor fails the check. It runs in the check over the lines a change touches, every new file and every file whose spec a change touches.

| Why | Check | Tags |
|---|---|---|
| a suite that lets mutants live is weaker than its coverage says, and a mutant in code no test runs also holds every line to a test. | tool/mutation | [testing] |
