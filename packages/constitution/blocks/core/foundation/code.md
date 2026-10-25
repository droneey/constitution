# Code

> Governs any code no other chapter governs.

## Responsibility

### unit-answers-to-one-actor · SHOULD

A class or a module answers to one actor: the one person or group whose needs change it.

| Why | Tags |
|---|---|
| a unit that serves two actors changes for both, and a change for one breaks the other. | [] |

### fact-has-one-source · MUST

Each fact — a value, a rule of the business, a piece of state — has one home that is its source; everything else reads it or derives from it. A copy kept for speed is marked as derived and rebuilt from its source, and a figure a document or a message reports about the program's data is computed from that data.

| Why | Tags |
|---|---|
| two copies of one fact drift apart, and the program is then wrong in one of them. | [data] |

### structure-appears-by-symptom · SHOULD

A structure — an abstraction, a pattern, a shared module, a layer — appears when a present need demands it; code that only looks alike waits for its third occurrence before it is joined; a new member of an open set is registered at once, without waiting.

| Why | Tags |
|---|---|
| a structure made in advance guesses its axis, usually wrongly, and must be torn out before it can be fixed. | [] |

### new-kind-added-as-a-member · MUST

A new kind of an open set — a vendor, a command, a format — is added as a new member and its registration, without editing the code that handles the other members. A set is open when its members share one contract and the program treats them alike — vendors, commands, formats — and closed when the program's logic decides on each member apart — stages, outcomes; a set with one member is not yet open.

| Why | Tags |
|---|---|
| code that grows by addition leaves every existing member untouched, so adding one cannot break another. | [] |

## Clarity

### code-reads-plainly · SHOULD

Code takes the longer, plain form over the terse, clever one: no nested conditional expression, no assignment inside a condition — save a binding form a language made for testing the value it binds — no trick a reader must decode.

| Why | Tags |
|---|---|
| clever code saves its author a minute and costs every reader more. | [] |

### statements-grouped-by-blank-lines · SHOULD

A blank line sets apart from the statements before and after it a compound statement — a condition, a loop, a switch, a try —, a `delete`, and a function, declared or held by a variable. It comes before a return, a throw, a break or a continue, and after one when code follows it. A variable declaration begins a group: a blank line comes before it when another kind of statement precedes it, the calls and assignments on its variable or its members that directly follow it belong to the group, and a blank line ends the group before the next statement of another kind. Consecutive declarations, consecutive expression statements outside a group, and the first statement of a block need none.

| Why | Tags |
|---|---|
| a blank line shows where one step of a body ends and the next begins, so a reader takes the body in by its steps instead of line by line, and with the places fixed no review argues over them. | [] |

## Dead code

### code-never-commented-out · MUST

Code is never commented out; it is deleted.

| Why | Tags |
|---|---|
| commented-out code is never compiled, checked or tested, yet a reader takes it for code that still means something. | [] |

### dead-code-deleted · MUST

No file, dependency, export, parameter, variable or label is unused — save a parameter a contract or a framework imposes, spelled in its language's form for one left unused — and no statement is unreachable; production code that only the specs reach is unused too. An export a package offers to other packages through the entry it publishes is not dead.

| Why | Tags |
|---|---|
| dead code is read, kept and feared by people who cannot know it does nothing. | [] |

### feature-flag-retired-once-settled · SHOULD

A feature flag is a setting with an issue that names when it goes; once it serves one value everywhere, it is removed with the branch it no longer takes.

| Why | Tags |
|---|---|
| a flag that serves one value everywhere is a branch that never runs, and it hides from every tool because it is still read. | [] |
