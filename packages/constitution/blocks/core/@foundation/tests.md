# Tests

> Governs specs, cases, fakes, fixtures and the test gates.

## Vocabulary

A **spec** is a file of cases about one boundary, or a section of a file that only tests compile.

A **case** is one test in a spec: one behaviour checked under one condition.

A rule that says **test** binds a spec and a case alike.

A **boundary** is a unit a caller relies on, reached as its callers reach it.

A **fake** is a working implementation of a contract, as the relations chapter defines it, made for specs.

A **contract suite** is the one set of cases that every implementation of a contract, its fake included, passes.

The **test runner** is the tool that finds the specs and runs them.

**Test code** is a spec, a fake, a contract suite, fixtures, a golden file, a snapshot or an example that renders a unit in isolation for review, such as a component's story; all other code is production code.

The program's **assembly**{#assembly} is the code that only builds its parts and connects them, and its entry files hand the process to it.

An **engine** is the real software an implementation over an outside system drives, such as the system itself, a database, a broker, a parser or a file system.

A test's **sandbox** is all it may reach: a network only to the engines and the programs it started, on the loopback; a file system only in a temporary folder and, to read, in the repository's files; the processes it started; and the passwords and keys of its engines.

A spec is of one of four kinds:

**Unit spec.** One boundary, with fakes of the contracts through which it reaches the outside.

**Integration spec.** The code that talks to an outside system, against its real engine run in the sandbox, such as in a temporary folder, as the real parser or as a disposable instance of the engine.

**End-to-end spec.** A critical scenario of `PROJECT.md`, through the built program, the way its users reach it.

**Boot spec.** The whole program, started as its entry file starts it, with the real assembly and only the systems outside the program replaced by their fakes.

An **artefact** is one whole thing a program ships as, such as a binary, an image, a bundle or a built package, or its source at one version where nothing builds it.

The **built program** is the program run from its artefacts, reached the way its users reach it: for a library, its built package, called through its published entries as a consumer calls it.

The **behaviour word** is **`should`**{#behaviour-word} and the **condition word** **`when`**{#condition-word}.

A case's steps are its **arrange step**, its **act step** and its **assert step**, and their **step comments** are **`Arrange`**{#arrange-comment}, **`Act`**{#act-comment} and **`Assert`**{#assert-comment}.

Each spelling is a default.

A **gate** is a bar all the specs together meet for the project's check, as the tools chapter defines it, to pass, such as full coverage or every mutant killed.

The **logic under coverage** is all production code but generated files, declarations, vendored code, and the entry files and the assembly while they decide nothing.

## What a spec proves

### spec-proves-one-boundary · SHOULD

Every spec proves one boundary, and what the boundary uses is proven through it. Exempt: a helper's spec of its own, for a mutant of the helper that its boundary's spec does not kill.

| Why |
|---|
| a spec per file mirrors the layout, not the behaviour, and breaks when a helper moves while the behaviour stays, and a behaviour proven in two kinds of spec is read, run and updated twice for a bug either catches alone. |

### spec-named-after-its-boundary · SHOULD

Every spec is named after the boundary it proves. Exempt: a helper's spec of its own, which is named after its helper.

| Why |
|---|
| a spec named for anything else is not found by the reader of its boundary, and outlives a boundary it no longer names. |

### spec-only-for-behaviour · SHOULD

Every spec proves behaviour. Types, constants, schemas, entry files, generated files and third-party code get none. Exempt: a spec another rule asks for.

| Why |
|---|
| a spec of what does nothing proves nothing and breaks on every edit. |

### constant-others-rely-on-pinned-by-a-table · SHOULD

Every set of constants a reader outside the code relies on is proven by one table of its own. Such constants include the codes users script against and the names another system reads.

| Why |
|---|
| a constant others rely on changes their behaviour when it changes, and no spec of behaviour notices the change. |

### case-asserts-what-a-caller-observes · SHOULD

Every case checks an outcome a caller observes. Such outcomes include a returned value, a changed state and what a user sees. Exempt: a call on a fake, where the call itself is the behaviour.

| Why |
|---|
| a test of calls breaks when the implementation changes and passes when the behaviour breaks behind the same calls. |

### case-earns-its-place · SHOULD

Every case earns its place by failing for a plausible bug no other case catches. One that cannot fail, such as a restated constant, a check of a library or a duplicate, is deleted. Exempt: a row of a table the constant-others-rely-on-pinned-by-a-table rule asks for.

| Why |
|---|
| a case that catches nothing costs reading, running and updating, and makes the specs look stronger than they are. |

### declared-failure-has-a-case · SHOULD

Every failure a boundary declares has a case that produces it and checks what the caller receives.

| Why |
|---|
| a failure path is the code least exercised by use, so it is the first to break unnoticed. |

### edge-cases-chosen-by-risk · SHOULD

Every spec's boundary cases are chosen by risk and by the partitions of the input. Such cases include empty input, the values on and off each limit, Unicode, invalid input, a concurrent call and a lost connection.

| Why |
|---|
| bugs live at the boundaries, and cases picked without the partitions of the input pile up in its middle while the boundary that breaks goes untested — equivalence partitioning and boundary-value analysis. |

### property-tested-where-it-pays · SHOULD

Every checked constructor, mapper that can be inverted, transition function and parser of values from outside has a property case. A parser's case proves that on any input it returns a value or its declared failure and nothing else.

| Why |
|---|
| cases written by hand miss the inputs no author thought of — property-based testing. |

### property-counterexample-kept-as-a-fixed-case · SHOULD

Every counterexample a property case finds is kept as a fixed case.

| Why |
|---|
| a counterexample not kept lets the input that broke the code come back unseen. |

### lifecycle-tested-to-its-final-stage · SHOULD

Every value that moves through stages is tested through every move to each of its final stages. Each case takes one path from its first stage to a final stage and checks each step, and the paths together take every move.

| Why |
|---|
| each transition may pass alone while their sequence breaks. |

### critical-scenario-has-an-end-to-end-spec · SHOULD

Each critical scenario of `PROJECT.md` has one end-to-end spec. Its cases walk the scenario's steps through the built program, the way its users reach it.

| Why |
|---|
| a critical scenario proven only in its parts breaks where the parts meet — the test pyramid. |

### end-to-end-spec-holds-no-variant · SHOULD

Every end-to-end spec walks its scenario only, never a variant a unit or an integration spec proves.

| Why |
|---|
| a variant proven end to end costs the slowest run for a bug a faster spec already catches — the test pyramid. |

## How a case is written

### case-proves-one-intent · SHOULD

Every case proves one intent, asserting only the part of the outcome the intent is about.

| Why |
|---|
| a case of several intents fails without saying which behaviour broke, and an assertion on the whole outcome fails on every change to a part another case is about. |

### case-asserts-by-strict-equality · SHOULD

Every assertion of a case compares by strict equality, never by a loose one. Exempt: an assertion that compares no two values, such as the invariant a property case states or a parse's rejection of its input.

| Why |
|---|
| a loose equality lets the part it compares change unseen, so the case passes on a value it was meant to refuse. |

### case-pins-meaning-never-wording · MUST

Every case pins what a text means, never its wording. It reads a message, a report or a rendered text by what it means, such as its code, its subject and the values it names, taken from the value before it is rendered where the unit gives one, and compares that whole.

| Why |
|---|
| a case that pins wording fails on every rewording while the behaviour holds, so one change of text rewrites the specs. |

### renderer-wording-pinned-once · SHOULD

Every renderer's wording and layout are pinned once, by a case that compares its generated output.

| Why |
|---|
| wording no case pins changes unseen, so the text its users read breaks while every case of meaning passes. |

### variants-are-one-table · SHOULD

The variants of every behaviour are one table of cases, each row naming its condition.

| Why |
|---|
| variants spread over separate cases hide which conditions are covered, so the missing one goes unseen. |

### case-holds-no-logic · MUST

Every case is a straight line of literal steps, never logic. It has no branch, loop or conditional expression.

| Why |
|---|
| logic in a case can be as wrong as the code it checks, and nothing checks the case. |

### expected-value-written-as-a-literal · SHOULD

Every case's expected value is a literal, or a fixture's default with literal field values, never computed by the logic under test. Exempt: a property case, whose assert step states the invariant for every input it draws.

| Why |
|---|
| an expected value computed by the code under test agrees with whatever that code does. |

### fixture-builds-a-valid-default · SHOULD

Every fixture builds a valid value by default.

| Why |
|---|
| a fixture that builds an invalid value makes every case build its own value whole — a test data builder. |

### fixture-takes-the-values-a-case-sets · SHOULD

Every fixture takes the field values a case sets in place of its defaults.

| Why |
|---|
| a fixture that takes no field values makes every case that needs one field of its own build its value whole — a test data builder. |

### case-sets-only-the-fields-its-condition-is-about · SHOULD

Every case sets in a fixture only the fields its condition is about.

| Why |
|---|
| a case that sets every field hides the one it is about among the rest. |

### generator-built-on-the-fixture · SHOULD

Every property case's generator is built on the fixture, so each draw is valid. Exempt: a case about invalid input.

| Why |
|---|
| a generator with its own idea of a valid value spends its draws on input the unit refuses. |

### snapshot-readable-by-eye · SHOULD

Every snapshot holds only what a reader can check by eye.

| Why |
|---|
| a snapshot nobody reads is accepted whatever it holds. |

### generated-format-compared-with-one-golden-file · SHOULD

Every generated format is compared with one golden file a reader can read, never with a table of its wording.

| Why |
|---|
| a format pinned by a table of its wording is rewritten line by line while no reader sees it whole. |

### case-named-should-when · MUST

Every case's name gives its behaviour after the behaviour word, then, where it depends on one, its condition after the condition word. The name opens with the behaviour word.

| Why |
|---|
| a case named otherwise fails without saying which behaviour broke or under what condition, so every failure is opened before it is understood. |

### case-split-by-arrange-act-assert-comments · MUST

Every case is split into its arrange, act and assert steps, each opened by its step comment on its own line. Each is present once, in that order, and never left empty. Exempt: the arrange step of a case that arranges nothing, such as one whose table row gives every input, which is left out; and the act and assert steps of a lifecycle case, repeated for each transition, and of an end-to-end case, repeated for each step of its scenario.

| Why |
|---|
| a case whose steps run together leaves its reader to work out what is set up, what is done and what is proven — Arrange–Act–Assert. |

### act-makes-one-call · SHOULD

Every case's act step makes one call.

| Why |
|---|
| an act step of two calls hides which one the assert step is about. |

### test-runs-unconditionally · MUST

Every test runs unconditionally. No test is skipped, left unfinished, singled out so the others do not run, run only under a condition or expected to fail. Exempt: a test compiled only for the platform its code is compiled for.

| Why |
|---|
| a skipped test looks like coverage and proves nothing, and a singled-out one silently skips all the others. |

### test-asserts-something · MUST

Every test asserts something.

| Why |
|---|
| a test without an assertion passes whatever the code does, and counts as coverage it never gives. |

## Where test code lives

### spec-folder-holds-only-test-files · MUST

Every folder of specs holds only test code.

| Why |
|---|
| production code kept among the specs is held to the rules of test code by every tool that finds tests by their folder. |

### spec-found-from-its-units-path · SHOULD

Every unit's specs are found from the unit's path. They sit in a folder of specs beside the unit or, where the language's test runner expects one, in a tree of specs that mirrors the source, under the names package-part-sits-in-its-named-folder gives.

| Why |
|---|
| a spec placed apart from its unit's path is left behind when the unit moves, and outlives it when the unit is deleted. |

### test-code-never-reached-from-production · MUST

All production code imports only production code, never test code. Exempt: a further entry, as the dependencies chapter defines one, that a package offers for its consumers' tests, which re-exports by name the fakes and fixtures they test with and which no other production code imports.

| Why |
|---|
| a fake or a fixture in production code ships test behaviour to users, while one offered through a published entry of its own reaches only the tests that import it. |

## Practice

### test-ships-with-its-behaviour · MUST

Every test ships in the same change as the behaviour it proves. A change of behaviour updates its spec in that change. Exempt: a bug fix, whose case bug-fix-ships-with-a-reproducing-case governs.

| Why |
|---|
| a behaviour shipped without its test is a behaviour nobody tests later. |

### test-seen-failing · SHOULD

Every case has been seen failing for the right reason. It is written before the code, or after it with the code broken for a moment.

| Why |
|---|
| a case never seen failing may pass whatever the code does. |

### bug-fix-ships-with-a-reproducing-case · SHOULD

Every bug fix ships with a case that reproduces the bug.

| Why |
|---|
| a bug fixed without its own case may not be fixed, and can come back unseen. |

### flaky-test-fixed-never-retried · SHOULD

Every flaky case is fixed or deleted, never retried. A case that passes and fails on the same code is fixed in the next change, or deleted with a record of the race it found; no retry or rerun hides it.

| Why |
|---|
| a retried case hides the race it found, and specs that fail at random teach everyone to rerun instead of reading. |

## The sandbox

### test-runs-in-a-sandbox · MUST

Every test reaches nothing outside its sandbox. Exempt: the snapshots and golden files that a run told to update them writes.

| Why |
|---|
| a test that reaches the world is slow, flaky and can do real harm (a write to a real store, a call that spends a vendor's quota) and answers differently from one run to the next. |

### unit-spec-refuses-the-network · MUST

Every unit spec refuses the network. Once for all unit specs, the test runner refuses every connection a unit spec opens, by replacing each call that opens one with one that fails or by running the specs where no network is reachable.

| Why |
|---|
| a unit spec that reaches a server by mistake passes while the server answers and fails at random later, far from the mistake. |

### unit-case-stays-in-process · SHOULD

Every case of a unit spec stays in its process's memory, and so finishes in milliseconds. It runs with no output and no real clock and reads no file, and a case that needs more belongs in an integration spec. Exempt: its golden files and snapshots, which it reads.

| Why |
|---|
| slow unit specs stop being run on every change, and the bugs they would catch wait for a later, slower run. |

### case-independent-of-order · SHOULD

Every case passes alone and in any order. No state survives from one case or one file to the next.

| Why |
|---|
| a case that leans on another fails alone when someone runs it to find a bug. |

### case-order-shuffled · SHOULD

Every spec's cases run in an order the test runner shuffles. Exempt: a run of the mutation tool, which orders the cases itself.

| Why |
|---|
| a hidden dependence between cases stays hidden in a fixed order. |

### shuffle-seed-reported · SHOULD

Every shuffled run of the specs reports the seed that replays its order.

| Why |
|---|
| an order that failed cannot be replayed without its seed, so the dependence it showed is lost. |

### test-never-sleeps-a-fixed-time · SHOULD

Every test waits for a condition or advances a fake clock, never a fixed delay.

| Why |
|---|
| a fixed delay is too short on a slow machine, where the test then fails at random, and wasted on a fast one. |

## Fakes and engines

### contract-has-one-fake · SHOULD

Each faked contract has one fake, shared by every spec that needs it.

| Why |
|---|
| a fake per spec drifts from the real implementation in as many ways as there are specs. |

### contract-has-one-suite · SHOULD

Each faked contract has one contract suite. Its fake passes it, as does each real implementation whose engine runs in the sandbox.

| Why |
|---|
| a fake no suite holds to the contract behaves unlike the real one, so every test that uses it proves the wrong thing — contract testing. |

### effect-faked-never-mocked · SHOULD

Every spec replaces an effect only by the fake of its contract, never by mocking, patching or spying on a module. Exempt: beneath the code over an outside system whose engine the sandbox cannot run, a transport that serves captured responses, and beneath an implementation over a device or a system service, such as a camera, a keystore or an app store's billing, a fake of the platform's own API, held to that API like any other fake.

| Why |
|---|
| a mocked module replaces the code the spec claims to test and breaks when the module moves, and an engine the sandbox can run proves the code over it better than any capture of its answers. |

### integration-spec-runs-the-real-engine · SHOULD

Wherever its engine can run in the sandbox, every implementation over an outside system is proven against it.

| Why |
|---|
| a fake proves only the code that relies on the contract, so an implementation never run on its engine ships its mismatches with that engine unseen. |

### mapped-failure-proven-against-the-real-engine · SHOULD

Where the sandbox can run its engine, every failure an implementation over an outside system maps is proven against that engine.

| Why |
|---|
| a mapping proven only on a fake maps the failure its author expected, and ships its mismatch with the failure the engine really gives. |

## The gates

### program-start-proven-by-a-boot-spec · MUST

Every program with an entry file has a boot spec that sees it answer.

| Why |
|---|
| the entry files and the assembly are left out of the logic under coverage, so without a boot spec a program wired wrong passes every check and fails in production. |

### boot-spec-run-as-an-integration-spec · SHOULD

Every boot spec is kept and run as an integration spec is, though no engine in it is real.

| Why |
|---|
| a boot spec kept among the unit specs runs where the network is barred and every case stays in process, so it fails there or is skipped, and the start it proves goes unproven. |

### logic-fully-covered · MUST

All logic under coverage is covered in full by the specs of its boundaries. Coverage is every line and every function, and every branch where the test runner measures them, counted over the unit specs together with the integration specs of an implementation over an outside system whose engine runs in the sandbox; end-to-end specs count toward no coverage. Exempt: code a project leaves out of coverage explicitly, by name in the coverage tool's configuration or by a mark in the code, each with its reason.

| Why |
|---|
| a line no spec reaches is a missing case, where a bug waits unseen, or dead code, and code over a real engine that only its unit specs could cover is reached through a driver faked for its lines, which passes the gate while its mismatches with the engine ship. |

### every-mutant-killed · MUST

Where a mutation tool exists for the language, every mutant of the logic under coverage a change touches is killed. The specs the coverage gate counts kill it, and the logic a change touches is its changed lines and its new files. Exempt: a mutant no behaviour can tell apart, and one in code no caller relies on, such as a log call or text only a person reads, each left out by the tool's configuration or marked in the code with its reason.

| Why |
|---|
| specs that let mutants live are weaker than their coverage says, and a case written only to kill a mutant no caller would notice proves no plausible bug and binds the spec to the code's wording — mutation testing. |
