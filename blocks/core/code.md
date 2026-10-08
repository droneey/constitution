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
A structure — an abstraction, a pattern, a shared module, a layer — appears when a present need demands it; code that only looks alike waits for its third occurrence before it is joined.

| Why | Tags |
|---|---|
| a structure made in advance guesses its axis, usually wrongly, and must be torn out before it can be fixed. | [] |

### new-kind-added-as-a-member · MUST
A new kind of an open set — a vendor, a command, a format — is added as a new member and its registration, without editing the code that handles the other members. A set is open when its members are interchangeable ways to do one job — vendors, commands, formats — and closed when the program's logic decides on each member apart — stages, outcomes.

| Why | Tags |
|---|---|
| code that grows by addition leaves every existing member untouched, so adding one cannot break another. | [] |

## Clarity

### code-reads-plainly · SHOULD
Code takes the longer, plain form over the terse, clever one: no nested conditional expression, no assignment inside a condition, no trick a reader must decode.

| Why | Tags |
|---|---|
| clever code saves its author a minute and costs every reader more. | [] |

## Dead code

### code-never-commented-out · MUST
Code is never commented out; it is deleted.

| Why | Tags |
|---|---|
| commented-out code rots unseen, while deleted code stays recoverable from history. | [] |

### dead-code-deleted · MUST
No file, dependency, export, parameter, variable or label is unused, and no statement is unreachable; what only the specs reach is unused too. An export a package offers to other packages through the entry it publishes is not dead.

| Why | Tags |
|---|---|
| dead code is read, kept and feared by people who cannot know it does nothing. | [] |
