# Changes

> Governs a change, one step of a task's work: its scope and what it carries.

## Vocabulary

A **tidying** changes the structure of code and not its behaviour; a refactoring is one.

The specs, cases and boundaries a change touches are those the tests chapter defines.

A change's **description** is the text that says what the change does and why, kept with the change.

## Scope

### change-limited-to-its-task · SHOULD

Every change does what its task asks and nothing else. It holds no unrelated tidying, reformat or rename, and fixes no problem found outside the task on the way.

| Why |
|---|
| a change that also does something else hides its task among lines nobody asked for, so a reviewer misses what it changed and undoing it takes the rest with it. |

### problem-outside-the-task-reported · SHOULD

Every problem a change finds outside its task is reported.

| Why |
|---|
| a problem seen and left unsaid is found again by the next reader, or not at all, while it does its harm. |

### tidying-shipped-before-the-behaviour · SHOULD

Every tidying ships before the change of behaviour that needs it, as its own change. Exempt: a tidying that stays within the files the change of behaviour touches.

| Why |
|---|
| a change that mixes a tidying with a change of behaviour hides the behaviour among moved lines, so a reviewer cannot tell which line changed what the program does. |

### tidying-keeps-the-specs-of-its-boundaries · SHOULD

Every tidying leaves the specs of its boundaries unchanged. It changes no case's setup or expectation in a spec of a boundary; an expectation that has to change marks a change of behaviour, which ships as one. Exempt: a spec that follows a boundary the tidying renames or moves.

| Why |
|---|
| a tidying that also edits its specs can change the behaviour unseen, since the specs that would have caught it changed with it. |

## What it carries

### change-description-states-its-reason · SHOULD

Every change's reason is written in its description, never only in a conversation.

| Why |
|---|
| the next person who reads the change needs its reason, and a conversation is not where they will look. |

### change-corrects-the-documents-it-falsifies · SHOULD

Every change that makes a document false corrects it in the same change. Such documents include a readme, `PROJECT.md`, an example of the environment variables, a comment and a guide.

| Why |
|---|
| a document corrected later is not corrected, and a reader trusts the stale one until it costs them. |

### new-term-enters-the-glossary-with-its-change · SHOULD

Every term of the business a change introduces enters the glossary of `PROJECT.md` in that same change.

| Why |
|---|
| a term missing from the glossary falsifies no document, so no other rule brings it in, and the next name for the same thing is chosen anew and differs. |

### choice-between-alternatives-recorded · SHOULD

Every strategic choice between real alternatives is recorded with what it rejected. A strategic choice is one a later reader could propose again and that shapes much of the program beyond one rule or one module, such as its store, its framework, its protocol, its architecture or a policy many later changes follow. The change that makes it records the choice as it now stands in `DECISIONS.md`, in a few lines: what was chosen, what was rejected and why, and its date. Exempt: a choice the code, a rule's Why or the change's description already explains, such as a rule's wording, level or place, a rule split, merged or renamed, a fix or a version bump.

| Why |
|---|
| a strategic choice recorded without its rejected alternatives is argued again by everyone who meets them, and a log that also keeps every rule's change and every fix buries those few under what the history already holds — an architecture decision record. |

### change-to-a-trust-boundary-names-its-threats · SHOULD

Every change at a trust boundary names its threats and how each is met, in its description. So does a change that adds a way into the program, such as an endpoint, a subcommand, an upload or a consumer of messages. A trust boundary is a place where data or a call passes between parties the program trusts differently, such as where outside input, as the security chapter defines it, enters, where the program acts with rights its caller lacks, or where it hands data to another system.

| Why |
|---|
| a threat left unnamed while the design is still open is found in production, where it costs a breach instead of a sentence — threat modelling. |
