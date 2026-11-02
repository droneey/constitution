# Plan and apply

> Governs the plan and the apply.

## Plan

### plan-reads-the-observed-world · MUST

A plan reads the observed world. It compares the config file with the world as observed when the plan is made, never only with a record of the last run, so a change made by hand shows as drift.

| Why |
|---|
| a plan built from a record alone misses what changed outside the program, and apply then overwrites it or fails on it unseen. |

### plan-outcome-told-apart · MUST

A plan's outcome tells no change, a change and a failure apart. It does so in a form a caller branches on, such as a command's exit status, never only in its text.

| Why |
|---|
| a script or a schedule that checks for drift cannot tell “all in place” from “could not look” by reading prose. |

### plan-names-destroying-changes → irreversible-operation-runs-dry-by-default · MUST

A plan names every change that destroys something, and apply carries out none of them without an explicit flag.

| Why |
|---|
| a destroyed resource cannot be converged back, so one destroyed unseen or unasked is lost for good — fail-safe defaults. |

## Apply

### apply-carries-out-the-plan-shown · MUST

Apply carries out exactly the plan its user was shown. When the config file or the world changed since that plan, it stops and asks for a new one.

| Why |
|---|
| a user approves the plan they read, and an apply that does something else does what nobody approved. |

### apply-changes-only-what-the-program-owns · MUST

Apply changes only what the program owns. It changes and removes only what carries the program's mark of ownership, which it puts on everything it creates; what lacks the mark is left alone until the user adopts it.

| Why |
|---|
| a program that touches what it did not create destroys what other people and programs rely on. |

### second-run-changes-nothing → operation-idempotent-by-design · MUST

Applying the same config file twice reports no change the second time, and a test proves it.

| Why |
|---|
| a convergence that is not idempotent changes the world again on every rerun after a failure or on a schedule, and only a test catches the first change that breaks it. |

### interrupted-apply-converges-on-rerun · SHOULD

An interrupted apply converges on the next run. Cut off at any point, it leaves the world in a state the next run plans from and converges, with no step to repair by hand.

| Why |
|---|
| an apply is cut off sooner or later, and a world that needs hand repair afterwards turns one failure into an outage. |

### one-apply-at-a-time → write-on-read-data-is-conditional · MUST

One apply runs at a time on a target. An apply holds a lock on its target for its whole run, which a second apply waits for or is refused by.

| Why |
|---|
| two applies planned from one world each change it as if alone, and the second undoes or doubles the first. |
