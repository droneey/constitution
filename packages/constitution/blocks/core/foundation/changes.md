# Changes

> Governs a change, one step of a task's work: its scope, what it carries, its hand-back.

## Scope

### change-limited-to-its-task · SHOULD

A change does what its task asks and nothing else, and says what of the task it left undone. It holds no unrelated refactor, reformat or rename; a problem found outside the task is reported, not fixed on the way.

| Why |
|---|
| a change that also does something else hides its task among lines nobody asked for, so a reviewer misses what it changed and a revert takes the rest with it, while a part of the task left undone and unsaid is taken for done. |

### change-corrects-the-documents-it-falsifies · SHOULD

A change that makes a document false corrects it in the same change. The document may be a readme, `PROJECT.md`, an example of the environment, a comment or a guide.

| Why |
|---|
| a document corrected later is not corrected, and a reader trusts the stale one until it costs them. |

### change-moves-a-file-never-rewrites-it · MUST

A change that moves a file moves it, never deletes it and writes it anew.

| Why |
|---|
| a file written anew can lose or alter content unseen. |

### tidying-shipped-before-the-behaviour · SHOULD

A tidying ships before the change of behaviour, as its own change. This holds for each tidying or refactoring the task needs, unless it stays within the files the change of behaviour touches.

| Why |
|---|
| a diff that mixes a tidying with a change of behaviour hides the behaviour among moved lines, so a reviewer cannot tell which line changed what the program does. |

### tidying-keeps-the-specs-of-its-boundaries · SHOULD

A tidying or a refactoring leaves the specs of its boundaries unchanged. Neither changes a case's setup or expectation in a spec of a boundary, and a spec follows a boundary it renames or moves; an expectation that must change marks a change of behaviour, which ships as one.

| Why |
|---|
| a tidying or a refactoring that also edits its specs can change the behaviour unseen, since the specs that would have caught it changed with it. |

## What it carries

### format-changed-in-steps · MUST

A stored or shared format changes in steps. A change to a format that is stored or that others read — a schema, a file, a message, a contract another deployable or a released consumer reads — keeps the old data and the running readers working: the readers learn the new form beside the old one first, the writers and the stored data move to it next, and the old form is removed last.

| Why |
|---|
| data written before a change and readers deployed before it outlive the change, and a format switched in one step breaks them — the expand–contract pattern. |

### choice-between-alternatives-recorded · MUST

A choice between real alternatives is recorded with what it rejected. Such a choice is one a later reader could propose again — a store, a framework, a protocol, the split between two modules, a design turned down —, and the change that makes it records it in the project's `DECISIONS.md`: what was chosen, what was rejected and why, and its date. A choice the code, a rule or the commit already explains — a version bump, a fix, a rename, a tool's default kept — is not.

| Why |
|---|
| a choice recorded without its rejected alternatives is argued again by everyone who meets them — an architecture decision record. |

### change-to-a-trust-boundary-names-its-threats · SHOULD

A change at a trust boundary, or one that adds a way into the program, names its threats. Such a way is an endpoint, a command, an upload or a consumer of messages, and the change names how each threat is met.

| Why |
|---|
| a threat left unnamed while the design is still open is found in production, where it costs a breach instead of a sentence — threat modelling. |

## Hand-back

### change-handed-back-with-a-passing-check · MUST

A change is reported done only once the check passes with no error and no warning.

| Why |
|---|
| a change handed back red passes its failure to the next person, who did not cause it. |

### change-seen-working-before-hand-back · SHOULD

A change to what a user or a caller observes is seen working before it is handed back. It is run once in the built program, the way its user or caller reaches it — the command run, the endpoint called, the screen used — and the hand-back says how.

| Why |
|---|
| a passing check proves only the cases written, so a change handed back unrun fails its user at the first use the cases missed. |
