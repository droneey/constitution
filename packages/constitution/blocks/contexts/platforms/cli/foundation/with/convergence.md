# Convergence

> Governs the exit code of a convergence program's plan and what its flags may choose.

## General

### flag-never-changes-the-declared-state → run-reads-one-config-file · MUST

A flag of a convergence program chooses how the run goes — a stage, a target, the output — never what the declared state is.

| Why | Tags |
|---|---|
| a state a flag can change is no longer the one the config file declares, reviews and keeps. | [] |

### plan-with-changes-exits-with-its-own-code → plan-outcome-told-apart · MUST

A plan that finds changes exits with a code of its own in the exit map, apart from 0, which says nothing changes, and from every failure's code.

| Why | Tags |
|---|---|
| a script that runs the plan branches on the exit status, and a change reported as success or as failure is acted on wrongly. | [errors] |
