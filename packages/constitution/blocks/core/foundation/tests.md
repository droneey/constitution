# Tests

> Governs specs, cases, fakes, fixtures and the test gates.

## Levels

- **Unit spec.** One boundary, with fakes of the contracts through which it reaches the outside.
- **Integration spec.** The code that talks to an outside system, against its real engine inside a sandbox: a temporary folder, the real parser, a disposable container.
- **End-to-end spec.** A critical scenario of `PROJECT.md`, through the built program, the way its users reach it.

## What a spec proves

### spec-proves-one-boundary · SHOULD

A spec proves one boundary — a unit a caller relies on, reached as its callers reach it — and is named after it. What a boundary uses is proven through its spec; a helper gets a spec of its own only for a mutant of it that its boundary's spec does not kill, and the boundary's spec then drops the cases the helper's spec holds. Types, constants, schemas, entry files, generated files and third-party code get none unless a rule asks for one; a constant a reader outside the code relies on — a code users script against, a name another system reads — is proven by one table per contract.

| Why |
|---|
| a spec per file mirrors the layout, not the behaviour: it breaks when a helper moves while the behaviour stays, and a behaviour proven at two levels is read, run and updated twice for a bug either catches alone. |

### case-asserts-what-a-caller-observes · SHOULD

A case checks an outcome a caller observes — a returned value, a changed state, what a user sees — and a call on a fake only when the call itself is the behaviour.

| Why |
|---|
| a test of calls breaks when the implementation changes and passes when the behaviour breaks behind the same calls. |

### case-earns-its-place · SHOULD

A case earns its place by failing for a plausible bug no other case catches; a case that cannot fail — a restated constant, a check of a library, a duplicate — is deleted.

| Why |
|---|
| a case that catches nothing costs reading, running and updating, and makes the suite look stronger than it is. |

### declared-failure-has-a-case · SHOULD

Every failure a boundary declares has a case that produces it and checks what the caller receives.

| Why |
|---|
| a failure path is the code least exercised by use, so it is the first to break unnoticed. |

### edge-cases-chosen-by-risk · SHOULD

Edge cases are chosen by risk and by the partitions of the input — empty input, the values on and off each limit, Unicode, invalid input, a concurrent call, a lost connection.

| Why |
|---|
| bugs live at the edges, and choosing them by risk spends cases where a bug is likely. |

### property-tested-where-it-pays · SHOULD

A property test proves an invariant where one pays — the check of a value with an invariant, a mapper that can be inverted, a transition function, and a parser of outside input, which on any input returns a value or throws its declared failure and nothing else — with its cases in the spec of its unit and a counterexample it finds is kept as a fixed case.

| Why |
|---|
| a property test tries inputs no author thought of, and only a fixed case keeps the input that broke the code from coming back. |

### lifecycle-tested-to-its-final-state · SHOULD

A lifecycle test takes a value made by its factory through every transition to its final state and checks each step, in one case.

| Why |
|---|
| each transition may pass alone while their sequence breaks. |

## How a case is written

### case-proves-one-intent · SHOULD

A case proves one intent and asserts it with strict equality on the part of the outcome the intent is about, the outcome projected to its subject: a property case, on the invariant it states; a text, on what it means.

| Why |
|---|
| a failing case then names one broken behaviour; strict equality lets nothing in its part change unseen, and an assertion on the whole outcome fails on every change to a part another case is about. |

### case-pins-meaning-never-wording · MUST

A case reads a message, a report or a rendered text by what it means — its code, its subject, the values it names, the part the case is about, taken from the value before it is rendered where the unit gives one — and compares that whole; the wording and the layout of a format are pinned once, for each renderer, by comparing its generated format with one golden file a reader can read, never with a table of its wording.

| Why |
|---|
| a case that pins wording fails on every rewording while the behaviour holds, so one change of text rewrites a suite. |

### variants-are-one-table · SHOULD

The variants of one behaviour are one table of cases, each row naming its condition.

| Why |
|---|
| a table shows at a glance which conditions are covered and which are missing. |

### case-holds-no-logic · SHOULD

A case holds no branch, loop or conditional expression, and its expected value is a literal, or a fixture's default with literal overrides, never computed by the logic under test — save a property case, whose Assert states the invariant for every input it draws.

| Why |
|---|
| logic in a case can be as wrong as the code it checks. |

### fixture-builds-a-valid-default · SHOULD

A fixture is a factory that returns a valid value and takes overrides; a case overrides only the fields its condition is about, and a property test's generator is built on it, so each draw is valid unless the case is about invalid input.

| Why |
|---|
| a case that states only what it is about shows its cause next to its effect, and one definition of a valid value serves the cases and the draws, so no draw is wasted on input the unit refuses. |

### snapshot-readable-by-eye · SHOULD

No snapshot holds a structure a reader cannot check by eye.

| Why |
|---|
| a snapshot nobody reads is accepted whatever it holds. |

### case-named-should-when · SHOULD

A suite is named after its boundary, and a case reads `should <behaviour>`, with `when <condition>` where the behaviour depends on one, in the language’s spelling.

| Why |
|---|
| a failing case then says which behaviour broke and under what condition, without opening it. |

### case-split-by-arrange-act-assert-comments · MUST

A case is split into sections, each opened by a comment on a line of its own that names it — `Arrange`, `Act`, `Assert` — present once and in that order, and its Act makes one call; the Arrange may be left out when the case arranges nothing, as when a table's row gives every input, and is never left empty. A lifecycle case repeats an Act and an Assert, each opened by its comment, for each transition, and an end-to-end case for each step of its scenario.

| Why |
|---|
| a reader sees at once what is set up, what is done and what is proven. |

### test-never-skipped-or-empty · MUST

No test is skipped, pending, focused, run only under a condition, expected to fail, or without an assertion.

| Why |
|---|
| a skipped test looks like coverage and proves nothing, and a focused one silently skips all the others. |

### spec-folder-holds-only-test-files · MUST

A folder of specs holds only specs, fakes, contract suites, fixtures, golden files and the snapshots its runner writes, each named for its kind and after what it proves or serves.

| Why |
|---|
| a spec named otherwise would not run, and a helper named like a spec would. |

### spec-found-from-its-units-path · SHOULD

A unit's specs sit in a folder of specs beside the unit, or, where the language's runner expects one, in a tree of specs that mirrors the source.

| Why |
|---|
| a spec found from its unit's path is kept, moved and deleted with it. |

### test-code-never-reached-from-production · MUST

Test code — a spec, a fake, a fixture — is never imported by production code.

| Why |
|---|
| a fake or a fixture in production code ships test behaviour to users. |

## Practice

### test-ships-with-its-behaviour · MUST

A test ships in the same change as the behaviour it proves, and a change of behaviour updates its spec in the same change.

| Why |
|---|
| a behaviour shipped without its test is a behaviour nobody tests later. |

### test-seen-failing · SHOULD

Every test has been seen failing for the right reason: written before the code, or after it with the code broken for a moment; a bug fix ships with a test that reproduces the bug and was seen failing without the fix.

| Why |
|---|
| a test never seen failing may test nothing, and a bug's own failing test proves the fix fixes it and keeps it from coming back. |

### flaky-test-fixed-never-retried · SHOULD

A test that passes and fails on the same code is fixed in the next change, or deleted with an issue that names the race it found; no retry or rerun hides it.

| Why |
|---|
| a retried test hides the race it found, and a suite that fails at random teaches everyone to rerun instead of reading. |

### case-independent-of-order · SHOULD

A case passes alone and in any order; no state survives from one case or one file to the next, and the runner shuffles the cases and reports the seed that replays their order.

| Why |
|---|
| a case that leans on another fails alone when someone runs it to find a bug, and the seed lets anyone replay the order that failed. |

### test-never-sleeps-a-fixed-time · SHOULD

A test waits for a condition or advances a fake clock, never a fixed delay.

| Why |
|---|
| a fixed delay is too short on a slow machine and wasted on a fast one. |

### unit-case-stays-in-process · SHOULD

A unit case runs in one process with no output, no waiting and no real clock, and reads no file but its golden files and snapshots, and so finishes in milliseconds; a case that needs more is an integration case.

| Why |
|---|
| the unit suite runs on every change, and it is run often only while it is fast. |

## The sandbox

### test-runs-in-a-sandbox · MUST

A test touches no network beyond the engines it started on the loopback, no real file system outside a temporary folder, no process it did not start and no credential but those of the engines it started; the repository’s own files are read, never written — save the snapshots and golden files a run told to update them writes — and a real vendor is reached only apart from the tests.

| Why |
|---|
| a test that reaches the world is slow, flaky and can do real harm; a sandboxed one gives the same answer every run. |

### unit-spec-refuses-the-network · MUST

In a unit spec every call that opens a connection is replaced, once for all unit specs, with one that throws; an integration spec keeps the real calls to engines inside the sandbox.

| Why |
|---|
| a spec that reaches a server by mistake fails at once where the mistake is, instead of at random later. |

### contract-has-one-fake-and-one-suite · SHOULD

Each faked contract has one fake, shared by every spec that needs it, and one contract suite that the fake passes.

| Why |
|---|
| one fake is kept in step with its real implementation once, not once per spec, and a fake that behaves unlike the real implementation makes every test that uses it prove the wrong thing. |

### effect-faked-never-mocked · SHOULD

No spec mocks, patches or spies on a module of the program; an effect is replaced by the fake of its contract or, beneath the code that speaks to an outside system whose engine no spec can run in its sandbox, by a transport that serves captured responses.

| Why |
|---|
| a mocked module replaces the code the spec claims to test and breaks when the module moves, and an engine the sandbox can run proves the code over it better than any capture of its answers. |

### integration-spec-runs-the-real-engine · SHOULD

Each implementation of a contract over an outside system whose engine can run in the sandbox is proven against that engine there — by the contract suite where it has one — with a case for each failure it maps.

| Why |
|---|
| a fake proves the code that relies on the contract; only the real engine proves the implementation keeps it. |

### critical-scenario-has-an-end-to-end-spec · SHOULD

Each critical scenario of `PROJECT.md` has one end-to-end spec through the built program, the way its users reach it, whose cases walk the scenario's steps and never a variant a unit or an integration spec proves.

| Why |
|---|
| the scenarios that must never break are proven the way users meet them, and no more end-to-end tests are paid for than that; a variant proven end to end costs the slowest run for a bug a faster spec already catches. |

## The gates

### logic-fully-covered · MUST

Logic — all production code but the entry files, the file that wires the program, generated files, declarations and vendored code — is covered at 100 percent of lines and functions, and of branches where the runner measures them, by the specs of its boundaries: the unit specs and, for an implementation of a contract over an outside system whose engine runs in the sandbox, its integration specs as well; end-to-end specs count toward no coverage. A line no behaviour reaches is a missing case or dead code.

| Why |
|---|
| specs of behaviour at the boundaries reach every line a caller can reach, so the gate costs nothing extra and catches dead code; the code over a real engine is reached on that engine, never through a driver faked only to cover its lines. |

### every-mutant-killed · MUST

Mutation testing measures the specs, running each mutant against those the coverage gate counts and never the end-to-end specs, and every mutant of the logic a change touches — its changed lines and its new files — is killed; a mutant no behaviour can tell apart, and one in code no caller relies on — a log call, text only a person reads — is left out by the tool's configuration or marked in the code with its reason.

| Why |
|---|
| a suite that lets mutants live is weaker than its coverage says, a mutant in code over a real engine is killed only by the specs that run it on that engine, and a case written only to kill a mutant no caller would notice proves no plausible bug and binds the spec to the code's wording. |
