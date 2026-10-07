# Command line with convergence

> The command that starts a converged document.

### init-writes-document-from-template · SHOULD
An `init` command writes one document from a template, named after the program.

| Why | Tags |
|---|---|
| a user starts from a valid document, not from a blank page. | [ux] |

### plan-with-changes-exits-with-its-own-code → plan-outcome-told-apart · MUST
A plan that finds changes exits with a code of the map's own for it, apart from success with no change and from every failure.

| Why | Tags |
|---|---|
| a script that runs the plan branches on the exit status, and a change reported as success or failure is acted on wrongly. | [] |

### flag-never-changes-the-declared-state → run-reads-one-config-file · MUST
A flag of a convergence program chooses how the run goes — a stage, a target, the output — never what the declared state is.

| Why | Tags |
|---|---|
| a state a flag can change is no longer the one the file declares, reviews and keeps. | [] |
