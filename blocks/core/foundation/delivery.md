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
One command runs every check of the repository — format, lint, types, tests, coverage, mutation, the rest of the project's tools — and `constitution.yaml` names it.

| Why | Check | Tags |
|---|---|---|
| one command means nobody has to know which checks exist, and everyone who runs it runs the same checks. | review | [] |

## check-chains-one-entry-per-area → one-check-command
Each area of the check — `format`, `lint`, `type`, `test`, `mutation`, `unused` and the rest — has one `<area>:check` entry of the repository's runner that only checks and runs every tool of that area, in each language of the repository, and an `<area>:fix` beside it where a tool can write; the check command chains the check entries.

| Why | Check | Tags |
|---|---|---|
| CI, the hooks and a person run the same names, so the names stay stable, and a second language adds its tools to the areas rather than a second set of names. | review | [] |

## check-only-checks · MUST
The check verifies and never changes a tracked file: it generates nothing, formats nothing and rewrites nothing. A tool's cache in an ignored folder is not a change.

| Why | Check | Tags |
|---|---|---|
| a check that writes can pass by changing what it checks, and leaves a change nobody made on purpose. | review | [] |

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

## kebab-case-file-names · MUST
Files and folders are named in kebab-case. Root files that convention names in upper case — `README.md`, `LICENSE.md` — keep it, and the language block fixes the case of source files.

| Why | Check | Tags |
|---|---|---|
| one case removes a decision from every new file and keeps names portable across file systems. | tool/names | [] |

## public-repository-carries-a-licence · SHOULD
A public repository carries a licence file that names its author.

| Why | Check | Tags |
|---|---|---|
| code without a licence can be read but not lawfully used, and without an author nobody can ask. | review | [] |

## public-repository-states-security-policy · SHOULD
A public repository carries `SECURITY.md`, which says how to report a vulnerability privately and which versions get fixes.

| Why | Check | Tags |
|---|---|---|
| a finder with no private channel reports in public or not at all, and either way the users learn last. | review | [security] |
