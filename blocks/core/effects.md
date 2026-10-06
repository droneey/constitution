# Effects

> Governs what a program does outside itself: calls, resources, concurrent work, records and configuration.

## Calls and resources

### async-work-awaited-or-detached-on-purpose · MUST
Asynchronous work is awaited, or detached on purpose with its failure handled.

| Why | Tags |
|---|---|
| forgotten work fails where nobody listens, and the program carries on as if it succeeded. | [errors] |

### outside-call-has-a-timeout · MUST
Every call across a process boundary has a timeout.

| Why | Tags |
|---|---|
| a call without a timeout can hang for ever and take its caller with it. | [errors, performance] |

### outside-call-can-be-cancelled · SHOULD
Every call across a process boundary can be cancelled by its caller.

| Why | Tags |
|---|---|
| a call that cannot be cancelled keeps working for a caller who left. | [performance] |

### resource-released-on-every-path · MUST
A resource the code acquires — a handle, a connection, a lock, a subscription — is released on every way out, a failure’s included, by the language’s scoped form of release.

| Why | Tags |
|---|---|
| a release written only on the path that succeeds leaks on the first failure, and the leak shows far from its cause. | [] |

### outside-read-bounded · SHOULD
Every read of a collection from outside the program — a query, a remote list, a queue, a file — has an explicit limit, and pages or refuses beyond it.

| Why | Tags |
|---|---|
| an unbounded read works on test data and fails in production when the data grows. | [performance] |

### concurrent-work-bound-to-its-scope · SHOULD
Concurrent work starts within a scope that waits for it, cancels it and receives its failures; no task outlives the operation that started it.

| Why | Tags |
|---|---|
| a task that outlives its scope leaks resources and reports its failures to nobody. | [errors] |

## Operations

### operation-idempotent-by-design · SHOULD
An operation that may be repeated is idempotent: a key is minted once per intent and sent with every attempt, child identifiers are derived deterministically, and a transition to the current state does nothing.

| Why | Tags |
|---|---|
| networks retry and users click twice; an idempotent operation turns a repeat into no change. | [data] |

### irreversible-operation-runs-dry-by-default · MUST
An operation run against a system — a script, a command, a migration, a deployment — that destroys data, spends money, touches a live system or sends something outward runs only behind an explicit flag; without the flag it shows what it would do.

| Why | Tags |
|---|---|
| an irreversible operation run by mistake cannot be undone by a better test. | [security, ux] |

### shared-resource-has-one-writer · MUST
Every resource the program shares with its host — a signal’s handler, the exit code, the working directory, a standard stream — has one writer. A block that brings its own writer for such a resource claims it in a rule, and a block whose default writer another active block has claimed yields.

| Why | Tags |
|---|---|
| two writers of one resource overwrite each other in an order nobody chose. | [] |

## Records and configuration

### diagnostics-written-through-a-logger · MUST
Diagnostics are written only through a logger — the language’s standard one where it has one; a console or a standard stream carries only a command-line program’s output to its user, and no debug output or breakpoint ships.

| Why | Tags |
|---|---|
| one logger decides where diagnostics go and what they may carry, and stray output is noise that can leak what it prints. | [security] |

### configuration-parsed-once-at-start · MUST
Configuration is declared in one place and read only by its declared names, parsed once at start into a typed value the program receives; a missing or malformed setting fails the start.

| Why | Tags |
|---|---|
| a setting checked where it is first used fails in the middle of a request, long after the deployment that broke it. | [security] |
