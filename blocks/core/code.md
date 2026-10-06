# Code

> Governs any code, when no chapter below names what a rule governs.

## Responsibility

### unit-answers-to-one-actor · MUST
A unit of code — a class, a module, a file — answers to one actor: the one person or group whose needs change it.

| Why | Tags |
|---|---|
| a unit that serves two actors changes for both, and a change for one breaks the other. | [] |

### fact-has-one-source · MUST
Each fact — a value, a rule of the business, a piece of state — has one home that is its source; everything else reads it or derives from it. A copy kept for speed is marked as derived and rebuilt from its source, and a number shown in a document or a message is read from the data it describes.

| Why | Tags |
|---|---|
| two copies of one fact drift apart, and the program is then wrong in one of them. | [data] |

### structure-appears-by-symptom · SHOULD
A structure — an abstraction, a pattern, a shared module, a layer — appears when a present need demands it; code that only looks alike waits for its third occurrence before it is joined.

| Why | Tags |
|---|---|
| a structure made in advance guesses its axis, usually wrongly, and must be torn out before it can be fixed. | [] |

### new-kind-added-as-a-member · MUST
A new kind of an open set — a vendor, a command, a format — is added as a new member and its registration, without editing the code that handles the other members.

| Why | Tags |
|---|---|
| code that grows by addition leaves every existing member untouched, so adding one cannot break another. | [] |

## Clarity

### code-reads-plainly · SHOULD
Code takes the longer, plain form over the terse, clever one: no nested conditional expression, no assignment inside a condition, no trick a reader must decode.

| Why | Tags |
|---|---|
| clever code saves its author a minute and costs every reader more. | [] |
