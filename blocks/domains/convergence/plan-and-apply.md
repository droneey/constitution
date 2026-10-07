# Plan and apply

> Governs the plan and the apply.

## Plan

### plan-reads-the-observed-world · MUST
A plan compares the config file with the world as observed when the plan is made, never only with a record of the last run, so a change made by hand shows as drift.

| Why | Tags |
|---|---|
| a plan built from a record alone misses what changed outside the program, and apply then overwrites it or fails on it unseen. | [data] |

### plan-outcome-told-apart · MUST
A plan's result tells apart no change, a change and a failure, in a form a caller branches on, such as a command's exit status, never only in its text.

| Why | Tags |
|---|---|
| a script or a schedule that checks for drift cannot tell “all in place” from “could not look” by reading prose. | [errors] |

### plan-names-destroying-changes → irreversible-operation-runs-dry-by-default · MUST
A plan names every change that destroys something, and apply carries out none of them without an explicit flag.

| Why | Tags |
|---|---|
| a destroyed resource cannot be converged back, so the user must see it and ask for it. | [data] |

## Apply

### apply-carries-out-the-plan-shown · MUST
Apply carries out exactly the plan its user was shown; when the config file or the world changed since that plan, it stops and asks for a new one.

| Why | Tags |
|---|---|
| a user approves the plan they read, and an apply that does something else does what nobody approved. | [data] |

### apply-changes-only-what-the-program-owns · MUST
Apply changes and removes only what carries the program's mark of ownership, which it puts on everything it creates; what lacks the mark is left alone until the user adopts it.

| Why | Tags |
|---|---|
| a program that touches what it did not create destroys what other people and programs rely on. | [data] |

### second-run-changes-nothing → operation-idempotent-by-design · MUST
Applying the same config file twice reports no change the second time, and a test proves it.

| Why | Tags |
|---|---|
| convergence is safe to rerun only while it is idempotent, and only a test keeps it so. | [testing] |

### interrupted-apply-converges-on-rerun · SHOULD
An apply cut off at any point leaves the world in a state the next run plans from and converges, with no step to repair by hand.

| Why | Tags |
|---|---|
| an apply is cut off sooner or later, and a world that needs hand repair afterwards turns one failure into an outage. | [errors] |

### one-apply-at-a-time → shared-resource-has-one-writer · MUST
An apply holds a lock on its target for its whole run, which a second apply waits for or is refused by.

| Why | Tags |
|---|---|
| two applies planned from one world each change it as if alone, and the second undoes or doubles the first. | [data] |
