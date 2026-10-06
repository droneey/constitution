# Delivery

> How a change is made, checked and handed back, and which files a repository keeps. How changes are recorded and integrated is the business of version control and its blocks.

## The change

## read-governing-rules-first · SHOULD
Before a change, read the rules that govern it: core's chapters and the files of the active blocks whose concern the change touches.

| Why | Check | Tags |
|---|---|---|
| a rule read after the code is written costs a rewrite; read before, it costs nothing. | review | [] |

## scope-limited-to-the-task · SHOULD
A change does what the task asks and nothing else: no unrelated refactor, reformat or rename. A problem found outside the task is reported, not fixed on the way, and what the task asked but was not done is said.

| Why | Check | Tags |
|---|---|---|
| a change that does one thing is reviewed, reverted and understood as one thing. | review | [] |

## documents-change-with-what-they-describe · SHOULD
A change that makes a document false — the README, `PROJECT.md`, an example of the environment, a comment, a guide — corrects it in the same change.

| Why | Check | Tags |
|---|---|---|
| a document corrected later is not corrected, and a reader trusts the stale one until it costs them. | review | [] |

## The check

## one-check-command · MUST
The project has one check that runs every tool holding a rule and fails on a violation, and `constitution.yaml` names its command.

| Why | Check | Tags |
|---|---|---|
| one check means nobody has to know which tools exist, and everyone who runs it is held to the same rules. | review | [] |

## check-passes-before-hand-back · MUST
The check passes, with no error and no warning, before a change is reported done. Completion is never claimed without it.

| Why | Check | Tags |
|---|---|---|
| a change handed back red passes its failure to the next person, who did not cause it. | review | [testing] |

## review-against-active-rules-before-hand-back · SHOULD
Before a change is handed back, it is reviewed against every active rule that no tool holds, not only those the task seemed to touch.

| Why | Check | Tags |
|---|---|---|
| tools hold what they can; the rest is kept only by someone reading the change against the rules. | review | [] |

## Files of a repository

## project-files-at-root · SHOULD
A repository keeps at its root `constitution.yaml`, the blocks it follows and their overrides, and `PROJECT.md`, the product's context.

| Why | Check | Tags |
|---|---|---|
| every agent and person finds the rules and the context of a repository in the same two places. | review | [] |

## readme-is-the-front-door · SHOULD
`README.md` says what the repository is, how to install and run it, and how to change it — for a reader who knows nothing else.

| Why | Check | Tags |
|---|---|---|
| the README is the first page anyone opens; a reader who must look elsewhere to start has been turned away. | review | [] |

## docs-for-readers-outside-the-code · SHOULD
`docs/` is for readers outside the code: users, integrators, operators. Knowledge about a module lives in a README beside it.

| Why | Check | Tags |
|---|---|---|
| knowledge beside its module changes with it; one folder of everything drifts from the code it describes. | review | [] |
