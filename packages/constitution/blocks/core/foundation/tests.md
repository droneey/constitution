# Tests

> Governs specs, cases, fakes, fixtures and the test gates.

## The vocabulary

A **spec** is a file of cases about one boundary, and a **case** is one test in it: one behaviour checked under one condition. A rule that says **test** binds a spec and a case alike. **Test code** is a spec, a fake, a contract suite, fixtures, a golden file or a snapshot; all other code is production code. A spec is of one of three levels:

- **Unit spec.** One boundary, with fakes of the contracts through which it reaches the outside.
- **Integration spec.** The code that talks to an outside system, against its real engine inside a sandbox: a temporary folder, the real parser, a disposable container.
- **End-to-end spec.** A critical scenario of `PROJECT.md`, through the built program, the way its users reach it.

## What a spec proves

### spec-proves-one-boundary · SHOULD

A spec proves one boundary and is named after it. A boundary is a unit a caller relies on, reached as its callers reach it. What a boundary uses is proven through its spec; a helper gets a spec of its own only for a mutant of it that its boundary's spec does not kill, and the boundary's spec then drops the cases the helper's spec holds. Types, constants, schemas, entry files, generated files and third-party code get none unless a rule asks for one; a constant a reader outside the code relies on — a code users script against, a name another system reads — is proven by one table per contract.

| Why |
|---|
| a spec per file mirrors the layout, not the behaviour: it breaks when a helper moves while the behaviour stays, and a behaviour proven at two levels is read, run and updated twice for a bug either catches alone. |

### case-asserts-what-a-caller-observes · SHOULD

A case checks an outcome a caller observes. Such outcomes include a returned value, a changed state and what a user sees; a call on a fake is checked only when the call itself is the behaviour.

| Why |
|---|
| a test of calls breaks when the implementation changes and passes when the behaviour breaks behind the same calls. |

### case-earns-its-place · SHOULD

A case earns its place by failing for a plausible bug no other case catches. One that cannot fail — a restated constant, a check of a library, a duplicate — is deleted.

| Why |
|---|
| a case that catches nothing costs reading, running and updating, and makes the suite look stronger than it is. |

### declared-failure-has-a-case · SHOULD

Every failure a boundary declares has a case that produces it and checks what the caller receives.

| Why |
|---|
| a failure path is the code least exercised by use, so it is the first to break unnoticed. |

### edge-cases-chosen-by-risk · SHOULD

Edge cases are chosen by risk and by the partitions of the input. Such edges include empty input, the values on and off each limit, Unicode, invalid input, a concurrent call and a lost connection.

| Why |
|---|
| bugs live at the edges, and cases picked without the partitions of the input pile up in its middle while the edge that breaks goes untested — equivalence partitioning and boundary-value analysis. |

### property-tested-where-it-pays · SHOULD

A property case proves an invariant where one pays. It pays for the check of a value with an invariant, a mapper that can be inverted, a transition function, and a parser of outside input, which on any input returns a value or fails with its declared failure, in its language's form, and with nothing else. It sits in the spec of its unit, and a counterexample it finds is kept as a fixed case.

| Why |
|---|
| cases written by hand miss the inputs no author thought of, and a counterexample not kept as a fixed case lets the input that broke the code come back — property-based testing. |

### lifecycle-tested-to-its-final-state · SHOULD

A lifecycle case takes a value made by its starting transition through every transition to its final state and checks each step.

| Why |
|---|
| each transition may pass alone while their sequence breaks. |

### critical-scenario-has-an-end-to-end-spec · SHOULD

Each critical scenario of `PROJECT.md` has one end-to-end spec. The spec runs through the built program, the way its users reach it, and its cases walk the scenario's steps, never a variant a unit or an integration spec proves.

| Why |
|---|
| a critical scenario proven only in its parts breaks where the parts meet, the way its users meet it, while a variant proven end to end costs the slowest run for a bug a faster spec already catches — the test pyramid. |

## How a case is written

### case-proves-one-intent · SHOULD

A case proves one intent. It asserts the intent with strict equality on the part of the outcome the intent is about, the outcome projected to its subject: a property case, on the invariant it states; a text, on what it means.

| Why |
|---|
| a case of several intents fails without saying which behaviour broke, a loose equality lets its part change unseen, and an assertion on the whole outcome fails on every change to a part another case is about. |

### case-pins-meaning-never-wording · MUST

A case pins what a text means, never its wording. It reads a message, a report or a rendered text by what it means — its code, its subject, the values it names, the part the case is about, taken from the value before it is rendered where the unit gives one — and compares that whole; the wording and the layout of a format are pinned once, for each renderer, by the comparison of its generated format.

| Why |
|---|
| a case that pins wording fails on every rewording while the behaviour holds, so one change of text rewrites a suite. |

### variants-are-one-table · SHOULD

The variants of one behaviour are one table of cases, each row naming its condition.

| Why |
|---|
| variants spread over separate cases hide which conditions are covered, so the missing one goes unseen. |

### case-holds-no-logic · SHOULD

A case holds no logic. It has no branch, loop or conditional expression, and its expected value is a literal, or a fixture's default with literal overrides, never computed by the logic under test — save a property case, whose Assert states the invariant for every input it draws.

| Why |
|---|
| logic in a case can be as wrong as the code it checks, and an expected value computed by the code under test agrees with whatever that code does. |

### fixture-builds-a-valid-default · SHOULD

A fixture builds a valid value and takes overrides. A case overrides only the fields its condition is about, and a property case's generator is built on the fixture, so each draw is valid unless the case is about invalid input.

| Why |
|---|
| a case that sets every field hides the one it is about among the rest, and a generator with its own idea of a valid value spends its draws on input the unit refuses — a test data builder. |

### snapshot-readable-by-eye · SHOULD

No snapshot holds a structure a reader cannot check by eye. A generated format is compared with one golden file a reader can read, never with a table of its wording.

| Why |
|---|
| a snapshot nobody reads is accepted whatever it holds, and a format pinned by a table of its wording is rewritten line by line while no reader sees it whole. |

### case-named-should-when · SHOULD

A case reads `should <behaviour>`, with `when <condition>` where the behaviour depends on one. The words take the language’s spelling, and the case's suite is named after its boundary.

| Why |
|---|
| a case named otherwise fails without saying which behaviour broke or under what condition, so every failure is opened before it is understood. |

### case-split-by-arrange-act-assert-comments · MUST

A case is split into its Arrange, Act and Assert. Each section is opened by a comment on a line of its own that names it — **`Arrange`**{#arrange-comment}, **`Act`**{#act-comment} and **`Assert`**{#assert-comment} until its language's or its runner's block respells them —, present once and in that order, and its Act makes one call; the Arrange may be left out when the case arranges nothing, as when a table's row gives every input, and is never left empty. A lifecycle case repeats an Act and an Assert, each opened by its comment, for each transition, and an end-to-end case for each step of its scenario.

| Why |
|---|
| a case whose steps run together leaves its reader to work out what is set up, what is done and what is proven, and an Act of two calls hides which one the Assert is about — Arrange–Act–Assert. |

### test-never-skipped-or-empty · MUST

No test is skipped, pending, focused, run only under a condition, expected to fail, or without an assertion.

| Why |
|---|
| a skipped test looks like coverage and proves nothing, and a focused one silently skips all the others. |

## Where test code lives

### spec-folder-holds-only-test-files · MUST

A folder of specs holds only test code. Each of its files is named for its kind and after what it proves or serves, and its snapshots are the ones its runner writes.

| Why |
|---|
| a file of production code kept among the specs is held to the rules of test code by every tool that finds tests by their folder, and a file there named off its kind is missed: a spec named otherwise never runs, and a helper named like a spec runs as one. |

### spec-found-from-its-units-path · SHOULD

A unit's specs are found from the unit's path. They sit in a folder of specs beside the unit, or, where the language's runner expects one, in a tree of specs that mirrors the source.

| Why |
|---|
| a spec placed apart from its unit's path is left behind when the unit moves, and outlives it when the unit is deleted. |

### test-code-never-reached-from-production · MUST

Test code is never imported by production code. A further entry a package offers for its consumers' tests is the one exception: it re-exports by name the fakes and fixtures they test with, and no other production code imports it.

| Why |
|---|
| a fake or a fixture in production code ships test behaviour to users, while one offered through an entry of its own reaches only the tests that import that entry. |

## Practice

### test-ships-with-its-behaviour · MUST

A test ships in the same change as the behaviour it proves, and a change of behaviour updates its spec in the same change.

| Why |
|---|
| a behaviour shipped without its test is a behaviour nobody tests later. |

### test-seen-failing · SHOULD

Every case has been seen failing for the right reason, and every bug fix ships with one. A case is written before the code, or after it with the code broken for a moment, and a bug fix ships with a case that reproduces the bug and was seen failing without the fix.

| Why |
|---|
| a case never seen failing may pass whatever the code does, and a bug fixed without its own failing case may not be fixed, and can come back unseen. |

### flaky-test-fixed-never-retried · SHOULD

A flaky case is fixed or deleted, never retried. A case that passes and fails on the same code is fixed in the next change, or deleted with an issue that names the race it found; no retry or rerun hides it.

| Why |
|---|
| a retried case hides the race it found, and a suite that fails at random teaches everyone to rerun instead of reading. |

## The sandbox

### test-runs-in-a-sandbox · MUST

A test runs in a sandbox. It touches no network beyond the engines it started on the loopback, no real file system outside a temporary folder, no process it did not start and no credential but those of the engines it started; the repository’s own files are read, never written — save the snapshots and golden files a run told to update them writes — and a real vendor is reached only apart from the tests.

| Why |
|---|
| a test that reaches the world is slow, flaky and can do real harm (a write to a real store, a call that spends a vendor's quota) and answers differently from one run to the next. |

### unit-spec-refuses-the-network · MUST

A unit spec refuses the network. Once for all unit specs, the runner refuses every connection a unit spec opens — each call that opens one replaced with one that fails, or the specs run where no network is reachable —; an integration spec keeps the real calls to engines inside the sandbox.

| Why |
|---|
| a unit spec that reaches a server by mistake passes while the server answers and fails at random later, far from the mistake. |

### unit-case-stays-in-process · SHOULD

A unit case stays in its process's memory, and so finishes in milliseconds. It runs with no output, no waiting and no real clock, and reads no file but its golden files and snapshots; a case that needs more is an integration case.

| Why |
|---|
| a slow unit suite stops being run on every change, and the bugs it would catch wait for the pipeline. |

### case-independent-of-order · SHOULD

A case passes alone and in any order. No state survives from one case or one file to the next, and the runner shuffles the cases and reports the seed that replays their order.

| Why |
|---|
| a case that leans on another fails alone when someone runs it to find a bug, and an order that failed cannot be replayed without its seed. |

### test-never-sleeps-a-fixed-time · SHOULD

A test waits for a condition or advances a fake clock, never a fixed delay.

| Why |
|---|
| a fixed delay is too short on a slow machine, where the test then fails at random, and wasted on a fast one. |

## Fakes and engines

### contract-has-one-fake-and-one-suite · SHOULD

Each faked contract has one fake and one contract suite. The fake is shared by every spec that needs it, and it passes the suite.

| Why |
|---|
| a fake per spec drifts from the real implementation in as many ways as there are specs, and a fake no suite holds to the contract behaves unlike the real one, so every test that uses it proves the wrong thing — contract testing. |

### effect-faked-never-mocked · SHOULD

No spec mocks, patches or spies on a module of the program. An effect is replaced by the fake of its contract. Beneath the code that speaks to an outside system whose engine no spec can run in its sandbox, it is replaced by a transport that serves captured responses; and beneath an adapter over a device or a system service no sandbox runs — a camera, a keystore, an app store's billing —, by a fake of the platform's own API, held to that API like any other fake.

| Why |
|---|
| a mocked module replaces the code the spec claims to test and breaks when the module moves, and an engine the sandbox can run proves the code over it better than any capture of its answers. |

### integration-spec-runs-the-real-engine · SHOULD

An implementation over an outside system is proven against its real engine. This holds wherever the engine can run in the sandbox; it is proven there by its contract's suite where the contract has one, with a case for each failure it maps.

| Why |
|---|
| a fake proves only the code that relies on the contract, so an implementation never run on its engine ships its mismatches with that engine unseen. |

## The gates

### program-start-proven-by-a-boot-spec · MUST

Each program has a boot spec that starts it and sees it answer. The spec starts the program as its entry does — the real assembly, with only the systems outside the program replaced by their fakes.

| Why |
|---|
| the entry files and the code that assembles the program are left out of the gates, so without a boot spec a program wired wrong passes every check and fails in production. |

### logic-fully-covered · MUST

Logic is covered in full by the specs of its boundaries. Coverage is 100 percent of lines and functions, and of branches where the runner measures them, by the unit specs and, for an implementation of a contract over an outside system whose engine runs in the sandbox, its integration specs as well. Logic is all production code but generated files, declarations, vendored code, the entry files and the code that only assembles the program; the last two are left out only while they decide nothing. End-to-end specs count toward no coverage, and a line no behaviour reaches is a missing case or dead code.

| Why |
|---|
| a line no spec reaches is a missing case, where a bug waits unseen, or dead code; code over a real engine covered through a driver faked only to reach its lines passes the gate while its mismatches with the engine ship; and code that assembles the program and decides something is proven by no spec, since its boot spec proves only that it starts. |

### every-mutant-killed · MUST

Every mutant of the logic a change touches is killed. The logic a change touches is its changed lines and its new files, and mutation testing runs each mutant against the specs the coverage gate counts, never the end-to-end specs. A mutant no behaviour can tell apart, and one in code no caller relies on — a log call, text only a person reads — is left out by the tool's configuration or marked in the code with its reason.

| Why |
|---|
| a suite that lets mutants live is weaker than its coverage says, a mutant in code over a real engine is killed only by the specs that run it on that engine, and a case written only to kill a mutant no caller would notice proves no plausible bug and binds the spec to the code's wording. |
