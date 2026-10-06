# Changes

> Governs a change: what it covers, what it carries along, and how it is handed back.

## Scope

### change-limited-to-its-task · SHOULD
A change does what its task asks and nothing else — no unrelated refactor, reformat or rename; a problem found outside the task is reported, not fixed on the way, and what the task asked but was not done is said.

| Why | Tags |
|---|---|
| a change that does one thing is reviewed, reverted and understood as one thing. | [] |

### change-corrects-the-documents-it-falsifies · SHOULD
A change that makes a document false — a readme, the project’s context, an example of the environment, a comment, a guide — corrects it in the same change.

| Why | Tags |
|---|---|
| a document corrected later is not corrected, and a reader trusts the stale one until it costs them. | [] |

### change-moves-a-file-never-rewrites-it · MUST
A change that moves a file moves it, never deletes it and writes it anew, and edits it in another step.

| Why | Tags |
|---|---|
| a file written anew can lose or alter content unseen, and a move with edits hides the edits. | [] |

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
