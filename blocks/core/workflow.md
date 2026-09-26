# Workflow

> How a change is made, checked and handed back, and which files a repository keeps. How changes are recorded and integrated is the business of version control and its blocks.

## The change

## read-governing-rules-first · SHOULD
Before a change, read the rules that govern it: core's chapters and the files of the active blocks whose concern the change touches.
**Why:** a rule read after the code is written costs a rewrite; read before, it costs nothing.
**Check:** review
**Tags:** workflow

## scope-limited-to-the-task · SHOULD
A change does what the task asks and nothing else: no unrelated refactor, reformat or rename. A problem found outside the task is reported, not fixed on the way, and what the task asked but was not done is said.
**Why:** a change that does one thing is reviewed, reverted and understood as one thing.
**Check:** review
**Tags:** workflow

## move-files-never-recreate · MUST
A file that moves is moved, never deleted and written anew, and a moved file is not rewritten in the same step.
**Why:** a move keeps the file's history and shows the reviewer that nothing changed but its place.
**Check:** review
**Tags:** workflow

## The check

## one-check-command · MUST
One command runs every check of the repository — format, lint, types, tests, coverage, mutation, the rest of the project's tools — and `constitution.yaml` names it. CI runs the same command.
**Why:** one command means nobody has to know which checks exist, and what passes locally passes in CI.
**Check:** review
**Tags:** workflow

## check-only-checks · MUST
The check verifies and never changes a tracked file: it generates nothing, formats nothing and rewrites nothing. A tool's cache in an ignored folder is not a change.
**Why:** a check that writes can pass by changing what it checks, and leaves a change nobody made on purpose.
**Check:** review
**Tags:** workflow

## check-passes-before-hand-back · MUST
The check passes, with no error and no warning, before a change is reported done. Completion is never claimed without it.
**Why:** a change handed back red passes its failure to the next person, who did not cause it.
**Check:** review
**Tags:** workflow, testing

## review-against-active-rules-before-hand-back · SHOULD
Before a change is handed back, it is reviewed against every active rule that no tool holds, not only those the task seemed to touch.
**Why:** tools hold what they can; the rest is kept only by someone reading the change against the rules.
**Check:** review
**Tags:** workflow

## Files of a repository

## project-files-at-root · SHOULD
A repository keeps at its root `constitution.yaml`, the blocks it follows and their overrides, and `PROJECT.md`, the product's context.
**Why:** every agent and person finds the rules and the context of a repository in the same two places.
**Check:** review
**Tags:** workflow

## readme-is-the-front-door · SHOULD
`README.md` says what the repository is, how to install and run it, and how to change it — for a reader who knows nothing else.
**Why:** the README is the first page anyone opens; a reader who must look elsewhere to start has been turned away.
**Check:** review
**Tags:** workflow

## docs-for-readers-outside-the-code · SHOULD
`docs/` is for readers outside the code: users, integrators, operators. Knowledge about a module lives in a README beside it.
**Why:** knowledge beside its module changes with it; one folder of everything drifts from the code it describes.
**Check:** review
**Tags:** workflow

## working-notes-stay-out-of-history · SHOULD
Specs, plans and working notes live in a `local/` folder that version control ignores.
**Why:** working notes are true for a day; committed, they mislead every later reader.
**Check:** review
**Tags:** workflow

## generated-files-not-committed · SHOULD
Generated files are not committed; the build produces them. An application that commits some of its generated files chooses which, and they stay marked as generated.
**Why:** a committed copy of something the build produces drifts from its source and fills every diff.
**Check:** review
**Tags:** workflow

## kebab-case-file-names · MUST
Files and folders are named in kebab-case. Root files that convention names in upper case — `README.md`, `LICENSE.md` — keep it, and the language block fixes the case of source files.
**Why:** one case removes a decision from every new file and keeps names portable across file systems.
**Check:** tool — names
**Tags:** naming

## public-repository-carries-a-licence · SHOULD
A public repository carries a licence file that names its author.
**Why:** code without a licence can be read but not lawfully used, and without an author nobody can ask.
**Check:** review
**Tags:** workflow
