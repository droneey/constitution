# Changes

> Governs a change, the work of one task: its scope, what it carries, its hand-back.

## Scope

### change-limited-to-its-task · SHOULD
A change does what its task asks and nothing else — no unrelated refactor, reformat or rename; a problem found outside the task is reported, not fixed on the way, and what the task asked but was not done is said.

| Why | Tags |
|---|---|
| a change that does one thing is reviewed, reverted and understood as one thing. | [] |

### change-corrects-the-documents-it-falsifies · SHOULD
A change that makes a document false — a readme, `PROJECT.md`, an example of the environment, a comment, a guide — corrects it in the same change.

| Why | Tags |
|---|---|
| a document corrected later is not corrected, and a reader trusts the stale one until it costs them. | [] |

### change-moves-a-file-never-rewrites-it · MUST
A change that moves a file moves it, never deletes it and writes it anew.

| Why | Tags |
|---|---|
| a file written anew can lose or alter content unseen. | [] |

### tidying-shipped-before-the-behaviour · SHOULD
A tidying or a refactoring the task needs ships as its own change, before the change of behaviour, unless it stays within the files the change of behaviour touches.

| Why | Tags |
|---|---|
| each diff then reads as one thing, and a reviewer sees the behaviour change alone. | [] |

### format-changed-in-steps · MUST
A change to a format that is stored or that others read — a schema, a file, a message, a contract another deployable or a released consumer reads — keeps the old data and the running readers working: the readers learn the new form beside the old one first, the writers and the stored data move to it next, and the old form is removed last.

| Why | Tags |
|---|---|
| data written before the change and readers deployed before it outlive the change, and a format switched in one step breaks them. | [data] |

### choice-between-alternatives-recorded · SHOULD
A choice between real alternatives that a later reader could propose again is recorded, with what was rejected and why, in the change that makes it.

| Why | Tags |
|---|---|
| a choice recorded without its rejected alternatives is argued again by everyone who meets them. | [] |

## Hand-back

### change-handed-back-with-a-passing-check · MUST
A change is reported done only once the check passes with no error and no warning.

| Why | Tags |
|---|---|
| a change handed back red passes its failure to the next person, who did not cause it. | [testing] |

### change-seen-working-before-hand-back · SHOULD
A change to what a user or a caller observes is run once in the built program — the command run, the screen seen, the endpoint called — and the hand-back says how.

| Why | Tags |
|---|---|
| a passing check proves the cases written, not that the change works as asked. | [testing] |
