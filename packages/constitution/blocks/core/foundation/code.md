# Code

> Governs any code no other chapter governs.

## Responsibility

### unit-answers-to-one-actor · SHOULD

A class or a module answers to one actor: the one person or group whose needs change it.

| Why |
|---|
| a unit that serves two actors changes for both, and a change for one breaks the other. |

### fact-has-one-source · MUST

Each fact — a value, a rule of the business, a piece of state — has one home that is its source; everything else reads it or derives from it. A copy kept for speed is marked as derived and rebuilt from its source, and a figure a document or a message reports about the program's data is computed from that data.

| Why |
|---|
| two copies of one fact drift apart, and the program is then wrong in one of them. |

### structure-appears-by-symptom · MUST

A structure — an abstraction, a pattern, a shared module, a layer — appears when a present need demands it: a concept of the business, a boundary or a value that crosses one, a seam that makes a behaviour testable, or a rule that asks for it. A structure that earns one of these needs is kept, since removing it is the same error as adding one that earns none, and one that only forwards, restates or anticipates is removed; a concept or a decision left as a plain string, a flag or a repeated branch is a structure missing. Code that only looks alike waits for its third occurrence before it is joined; a new member of an open set is registered at once.

| Why |
|---|
| a structure made in advance guesses its axis and is torn out before it can be fixed, and one removed while its need stands leaves that need checked again wherever it is met: both cost the same. |

### new-kind-added-as-a-member · MUST

A new kind of an open set — a vendor, a command, a format — is added as a new member and its registration, without editing the code that handles the other members. A set is open when its members share one contract and the program treats them alike — vendors, commands, formats — and closed when the program's logic decides on each member apart — stages, outcomes; a set with one member is not yet open.

| Why |
|---|
| code that grows by addition leaves every existing member untouched, so adding one cannot break another. |

## Clarity

### code-reads-plainly · SHOULD

Code takes the longer, plain form over the terse, clever one: no nested conditional expression, no assignment inside a condition — save a binding form a language made for testing the value it binds — no trick a reader must decode.

| Why |
|---|
| clever code saves its author a minute and costs every reader more. |

### statements-grouped-by-blank-lines · SHOULD

A blank line sets apart from the statements before and after it a compound statement — a condition, a loop, a switch, a try —, a `delete`, and a function, declared or held by a variable. It comes before a return, a throw, a break or a continue, and after one when code follows it. A variable declaration begins a group: a blank line comes before it when another kind of statement precedes it, the calls and assignments on its variable or its members that directly follow it belong to the group, and a blank line ends the group before the next statement of another kind. Consecutive declarations, consecutive expression statements outside a group, and the first statement of a block need none.

| Why |
|---|
| a blank line shows where one step of a body ends and the next begins, so a reader takes the body in by its steps instead of line by line, and with the places fixed no review argues over them. |

## Dead code

### code-never-commented-out · MUST

Code is never commented out; it is deleted.

| Why |
|---|
| commented-out code is never compiled, checked or tested, yet a reader takes it for code that still means something. |

### dead-code-deleted · MUST

No file, dependency, export, parameter, variable or label is unused — save a parameter a contract or a framework imposes, spelled in its language's form for one left unused — and no statement is unreachable; production code that only the specs reach is unused too. An export a package offers to other packages through the entry it publishes is not dead, nor is a type that names a part of an exported function's signature — its parameter object, its result — though only specs import it.

| Why |
|---|
| dead code is read, kept and feared by people who cannot know it does nothing; the type of a signature's part is the contract a caller writes its value against, used wherever the function is. |

### feature-flag-retired-once-settled · SHOULD

A feature flag is a setting with an issue that names when it goes; once it serves one value everywhere, it is removed with the branch it no longer takes.

| Why |
|---|
| a flag that serves one value everywhere is a branch that never runs, and it hides from every tool because it is still read. |
