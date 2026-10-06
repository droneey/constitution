# Tests

> Governs a spec, a case, a fake or fixture, and the gates the tests pass.

## Levels

- **Unit** — one boundary, with fakes of the contracts through which it reaches the outside.
- **Integration** — the code that talks to an outside system, against its real engine inside a sandbox: a temporary folder, the real parser, a disposable container.
- **End-to-end** — a critical scenario of the project's context, through the built program, the way its users reach it.

## What a spec proves

### spec-proves-one-boundary · SHOULD
A spec proves one boundary — a unit a caller relies on, reached through its public entry — and is named after it. What a boundary uses is proven through its spec; a helper gets a spec of its own only when its logic is worth cases of its own. Types, constants, schemas, entry files, generated files and third-party code get none unless a rule asks for one.

| Why | Tags |
|---|---|
| a spec per file mirrors the layout, not the behaviour: it breaks when a helper moves while the behaviour stays. | [testing] |

### constant-specced-only-as-a-contract · SHOULD
A constant gets a spec only when a reader outside the code relies on it — a code users script against, a name another system reads — and then as one table per contract.

| Why | Tags |
|---|---|
| a spec that restates a constant catches nothing and fails on every deliberate change. | [testing] |

### case-asserts-what-a-caller-observes · SHOULD
A case checks an outcome a caller observes — a returned value, a changed state, what a user sees — and a call on a fake only when the call itself is the behaviour.

| Why | Tags |
|---|---|
| a test of calls breaks when the implementation changes and passes when the behaviour breaks behind the same calls. | [testing] |

### case-earns-its-place · SHOULD
A case earns its place by failing for a plausible bug no other case catches; a case that cannot fail — a restated constant, a check of a library, a duplicate — is deleted.

| Why | Tags |
|---|---|
| a case that catches nothing costs reading, running and updating, and makes the suite look stronger than it is. | [testing] |

### declared-failure-has-a-case · SHOULD
Every failure a boundary declares has a case that produces it and checks what the caller receives.

| Why | Tags |
|---|---|
| a failure path is the code least exercised by use, so it is the first to break unnoticed. | [testing, errors] |

### edge-cases-chosen-by-risk · SHOULD
Edge cases are chosen by risk and by the partitions of the input — empty input, the values on and off each limit, Unicode, invalid input, a concurrent call, a lost connection.

| Why | Tags |
|---|---|
| bugs live at the edges, and choosing them by risk spends cases where a bug is likely. | [testing] |

### property-tested-where-it-pays · SHOULD
An invariant is proven by a property test where one pays — the check of a value with an invariant, a mapper that can be inverted, a transition function — with its cases in the spec of its unit; a counterexample it finds is kept as a fixed case.

| Why | Tags |
|---|---|
| a property test tries inputs no author thought of, and only a fixed case keeps the input that broke the code from coming back. | [testing] |

### lifecycle-tested-to-its-final-state · SHOULD
A lifecycle test takes a value made by its factory through every transition to its final state and checks each step, in one case.

| Why | Tags |
|---|---|
| each transition may pass alone while their sequence breaks. | [testing] |

### contract-has-one-suite · SHOULD
Each contract with a fake has one contract suite, run against the fake and against its real implementation.

| Why | Tags |
|---|---|
| a fake that behaves unlike the real implementation makes every test that uses it prove the wrong thing. | [testing] |

## How a case is written

### case-proves-one-intent · SHOULD
A case proves one intent and asserts it with strict equality on the whole outcome.

| Why | Tags |
|---|---|
| a failing case then names one broken behaviour, and a partial assertion lets the rest of the outcome change unseen. | [testing] |

### variants-are-one-table · SHOULD
The variants of one behaviour are one table of cases, each row naming its condition.

| Why | Tags |
|---|---|
| a table shows at a glance which conditions are covered and which are missing. | [testing] |

### case-holds-no-logic · SHOULD
A case holds no branch, loop or conditional expression, and its expected value is written as a literal.

| Why | Tags |
|---|---|
| logic in a case can be as wrong as the code it checks. | [testing] |

### fixture-builds-a-valid-default · SHOULD
A fixture is a factory that returns a valid value and takes overrides; a case overrides only the fields its condition is about.

| Why | Tags |
|---|---|
| a case that states only what it is about shows its cause next to its effect. | [testing] |

### snapshot-readable-by-eye · SHOULD
No snapshot holds a structure a reader cannot check by eye; a generated format is compared with a golden file a reader can read.

| Why | Tags |
|---|---|
| a snapshot nobody reads is accepted whatever it holds. | [testing] |

### case-named-should-when · SHOULD
A suite is named after its boundary, and a case reads `should <behaviour>`, with `when <condition>` where the behaviour depends on one, in the language’s spelling.

| Why | Tags |
|---|---|
| a failing case then says which behaviour broke and under what condition, without opening it. | [testing] |

### case-split-by-arrange-act-assert-comments · MUST
A case is split into three sections, each opened by a comment that names it — `Arrange`, `Act`, `Assert` — present once and in that order, and its Act makes one call; a lifecycle case repeats an Act and an Assert, each opened by its comment, for each transition.

| Why | Tags |
|---|---|
| a reader sees at once what is set up, what is done and what is proven. | [testing] |

### test-never-skipped-or-empty · MUST
No test is skipped, pending, focused, run only under a condition, expected to fail, or without an assertion.

| Why | Tags |
|---|---|
| a skipped test looks like coverage and proves nothing, and a focused one silently skips all the others. | [testing] |

### spec-folder-holds-only-test-files · MUST
A folder of specs holds only specs, fakes, fixtures and golden files, each named for its kind and after what it proves or serves.

| Why | Tags |
|---|---|
| a spec named otherwise would not run, and a helper named like a spec would. | [testing] |

### test-code-never-reached-from-production · MUST
Test code — a spec, a fake, a fixture — is never imported by production code.

| Why | Tags |
|---|---|
| a fake or a fixture in production code ships test behaviour to users. | [testing] |

## Practice

### test-ships-with-its-behaviour · MUST
A test ships in the same change as the behaviour it proves, and a change of behaviour updates its spec in the same change.

| Why | Tags |
|---|---|
| a behaviour shipped without its test is a behaviour nobody tests later. | [testing] |

### test-seen-failing · SHOULD
Every test has been seen failing for the right reason: written before the code, or after it with the code broken for a moment.

| Why | Tags |
|---|---|
| a test never seen failing may test nothing. | [testing] |

### bug-fix-starts-with-a-failing-test · SHOULD
A bug fix begins with the test that reproduces the bug, seen failing before the fix.

| Why | Tags |
|---|---|
| the test proves the fix fixes this bug and keeps it from coming back. | [testing] |

### flaky-test-fixed-never-retried · SHOULD
A test that passes and fails on the same code is fixed in the next change, or deleted with an issue that names the race it found; no retry or rerun hides it.

| Why | Tags |
|---|---|
| a retried test hides the race it found, and a suite that fails at random teaches everyone to rerun instead of reading. | [testing] |

### case-independent-of-order · SHOULD
A case passes alone and in any order; no state survives from one case or one file to the next, and the runner shuffles the cases and reports the seed that replays their order.

| Why | Tags |
|---|---|
| a case that leans on another fails alone when someone runs it to find a bug, and the seed lets anyone replay the order that failed. | [testing] |

### test-never-sleeps-a-fixed-time · SHOULD
A test waits for a condition or advances a fake clock, never a fixed delay.

| Why | Tags |
|---|---|
| a fixed delay is too short on a slow machine and wasted on a fast one. | [testing] |

### unit-case-stays-in-process · SHOULD
A unit case runs in one process with no input, output or waiting, and so finishes in milliseconds; a case that needs more is an integration case.

| Why | Tags |
|---|---|
| the unit suite runs on every change, and it is run often only while it is fast. | [testing] |

## The sandbox

### test-runs-in-a-sandbox · MUST
A test touches no network, no real file system outside a temporary folder, no real clock, no process it did not start and no credential; the repository’s own files are read-only fixtures, and a real vendor is reached only apart from the tests.

| Why | Tags |
|---|---|
| a test that reaches the world is slow, flaky and can do real harm; a sandboxed one gives the same answer every run. | [testing, security] |

### unit-spec-refuses-the-network · MUST
In a unit spec every call that opens a connection is replaced, once for all unit specs, with one that throws; an integration spec keeps the real calls to engines inside the sandbox.

| Why | Tags |
|---|---|
| a spec that reaches a server by mistake fails at once where the mistake is, instead of at random later. | [testing] |

### contract-has-one-fake · SHOULD
Each faked contract has one fake, shared by every spec that needs it.

| Why | Tags |
|---|---|
| one fake is kept in step with its real implementation once, not once per spec. | [testing] |

### effect-faked-never-mocked · SHOULD
No spec mocks, patches or spies on a module of the program; an effect is replaced by the fake of its contract.

| Why | Tags |
|---|---|
| a mocked module replaces the code the spec claims to test and breaks when the module moves. | [testing] |

### integration-spec-runs-the-real-engine · SHOULD
Each implementation of a contract over an outside system whose engine can run in the sandbox is proven against that engine there, with a case for each operation and each failure it maps; such a spec counts toward the coverage gate only for an engine the project owns.

| Why | Tags |
|---|---|
| a fake proves the code that relies on the contract; only the real engine proves the implementation keeps it. | [testing] |

### critical-scenario-has-an-end-to-end-spec · SHOULD
Each critical scenario of the project’s context has one end-to-end spec through the built program, the way its users reach it.

| Why | Tags |
|---|---|
| the scenarios that must never break are proven the way users meet them, and no more end-to-end tests are paid for than that. | [testing] |

## The gates

### every-spec-passes · MUST
Every spec passes.

| Why | Tags |
|---|---|
| a spec left failing proves nothing from then on. | [testing] |

### logic-fully-covered · MUST
All logic is covered at 100 percent of lines and functions, and of branches where the runner measures them, reached only through the specs of its boundaries; entry files, the wiring, generated files, declarations and vendored code are excluded. A line no behaviour reaches is a missing case or dead code.

| Why | Tags |
|---|---|
| specs of behaviour at the boundaries reach every line a caller can reach, so the gate costs nothing extra and catches dead code. | [testing] |

### every-mutant-killed · MUST
Mutation testing measures the specs, and every mutant of the logic is killed; a mutant no behaviour can tell apart is marked in the code as equivalent, with its reason.

| Why | Tags |
|---|---|
| a suite that lets mutants live is weaker than its coverage says. | [testing] |
