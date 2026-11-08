# Plan and apply

> Governs the reconciliation plan and the reconciliation apply.

## Vocabulary

The program's **mark of ownership** is a sign, such as a label, that it puts on what it creates in the managed world, telling it from what others made.

A **reconciliation target** is the part of the managed world one config file manages.

## Plan

### plan-reads-the-observed-world · MUST

Every reconciliation plan compares the config file with the observed world. It reads the managed world when the reconciliation plan is made, never only a record of the last reconciliation run.

| Why |
|---|
| a reconciliation plan built from a record alone misses what changed outside the program, a change made by hand among them, and the reconciliation apply then overwrites it or fails on it unseen. |

### plan-outcome-told-apart · MUST

Every reconciliation plan's outcome tells no change, a change and a failure apart. It does so in a form a caller branches on, such as the reconciliation run's exit status, never only in its text.

| Why |
|---|
| a script or a schedule that checks for drift cannot tell “all in place” from “could not look” by reading prose. |

### plan-names-destroying-changes · MUST

Every reconciliation plan names each change that destroys something.

| Why |
|---|
| a destroyed resource cannot be restored, so one destroyed unseen is lost for good. |

### destroying-change-applied-only-on-explicit-approval · MUST

Every change that destroys something is carried out by a reconciliation apply only on an explicit approval of that change.

| Why |
|---|
| a destroyed resource cannot be restored, so one destroyed unasked is lost for good — fail-safe defaults. |

## Apply

### apply-carries-out-the-plan-shown · MUST

Every reconciliation apply carries out exactly the reconciliation plan it acts on: the one its user was shown, or, for a reconciliation apply nobody watches, the one its reconciliation run made.

| Why |
|---|
| a user approves the reconciliation plan they read, and a reconciliation apply that does something else does what nobody approved. |

### stale-plan-never-applied → write-on-read-data-is-conditional · MUST

No reconciliation plan is applied once the config file or the managed world it was made from has changed. The reconciliation apply is refused, and asks for a new reconciliation plan.

| Why |
|---|
| a reconciliation plan made from a managed world that has since moved changes it as it no longer is and undoes or doubles what moved it, one made from a config file that has since changed carries out what its user no longer declares, and only a new one shows the user what the reconciliation run will now do. |

### apply-changes-only-what-the-program-owns · MUST

Every reconciliation apply changes and removes only what carries the program's mark of ownership. Exempt: what its user adopted by an act of its own, such as an import command, which then takes the mark.

| Why |
|---|
| a program that touches what it did not create destroys what other people and programs rely on. |

### unowned-declared-resource-fails-the-plan · MUST

Every reconciliation plan fails on what the config file declares and the managed world already holds without the program's mark of ownership.

| Why |
|---|
| a reconciliation apply may neither change what it does not own nor create a second one beside it, so a reconciliation plan that passes over it reports the declared state reached while another's resource stands in its place, and only a failure that names it tells its user to adopt it or to declare another. |

### created-resource-carries-the-ownership-mark · MUST

Everything a reconciliation apply creates carries the program's mark of ownership.

| Why |
|---|
| what the program created without its mark is left behind by every later reconciliation run, which no longer recognises it as its own to change or remove. |

### generated-secret-written-to-a-secret-store · MUST

Every secret a reconciliation apply generates itself is written, as it is generated, to a secret store the config file names.

| Why |
|---|
| a generated secret held only in memory is lost with the reconciliation run, so the next reconciliation apply generates another and locks out what the first one opened. |

### second-run-changes-nothing → operation-idempotent-by-design · MUST

Every second reconciliation apply of the same config file, on a managed world nothing else changed meanwhile, changes nothing. It reports no change.

| Why |
|---|
| a reconciliation apply that is not idempotent changes the managed world again on every rerun after a failure or on a schedule. |

### idempotent-apply-proven-by-a-test · SHOULD

Every program with a reconciliation apply has a test that applies one config file twice and finds no change the second time.

| Why |
|---|
| only a test catches the first change that makes a second reconciliation apply change the managed world again, before a rerun in production does. |

### one-apply-at-a-time · MUST

One reconciliation apply at a time runs on each reconciliation target. A second one waits for the first or is refused.

| Why |
|---|
| two reconciliation applies made from one observed world each change it as if alone, and the second undoes or doubles the first. |

### stopped-apply-frees-its-target · MUST

Every lock on a reconciliation target ends by itself once its reconciliation apply stops, a killed one's included.

| Why |
|---|
| a reconciliation apply is broken off sooner or later, and a lock that needs clearing by hand afterwards turns one failure into an outage; a lock that ends by itself is also the only kind core lets a reconciliation apply hold across its calls to the managed world. |
