# Code

> Governs any code no other chapter governs.

## Responsibility

### fact-has-one-source · MUST

Each fact has one source. Such a fact is a value, a rule of the business or a piece of state, and its source is its one home; everything else reads it or derives from it. A copy kept for speed is marked as derived and rebuilt from its source, and a figure a document or a message reports about the program's data is computed from that data.

| Why |
|---|
| two copies of one fact drift apart, and the program is then wrong in one of them — a single source of truth. |

### structure-appears-only-on-a-present-need · MUST

A structure appears when a present need demands it, and only then. The structures are an abstraction, a pattern, a shared module and a layer; a **present need**{#present-need} is a concept of the business, a boundary with something outside the program or a value that crosses it, a seam that makes a behaviour testable, or a rule that asks for it. One a present need earns is kept, one that only forwards, restates or anticipates is removed, and a concept or a decision left as a plain string, a flag or a repeated branch is a structure missing.

| Why |
|---|
| a structure made in advance guesses its axis and is torn out before it fits, and one removed while its need stands leaves that need handled again wherever it is met — you aren't gonna need it. |

### copies-joined-when-they-change-together · MUST

Look-alike code is joined only at its third occurrence, and only when its copies change together. Two copies of one piece of knowledge are no look-alike code: they are one fact, joined at once.

| Why |
|---|
| an abstraction drawn over code that only looks alike guesses an axis two cases cannot show and is torn apart when the copies change apart, while duplicated knowledge drifts the first time one copy changes alone — the rule of three, and DRY. |

## Clarity

### code-reads-plainly · SHOULD

Code takes the longer, plain form over the terse, clever one. It holds no nested conditional expression and no trick a reader must decode, and no assignment inside a condition, save a binding form a language made for testing the value it binds.

| Why |
|---|
| a terse, clever line saves its author a minute and is misread by every later reader, whose change then breaks what they did not decode — keep it simple. |

### statements-grouped-by-blank-lines · SHOULD

Blank lines set a body's steps apart. A blank line sets apart from the statements before and after it a compound statement — a condition, a loop, a switch, a try —, a statement that deletes a key or a binding, and a function, declared or held by a variable. It comes before a return, a throw, a break or a continue, and after one when code follows it. A variable's declaration — its first binding, in a language that declares none — begins a group: a blank line comes before it when another kind of statement precedes it, the calls and assignments on its variable or its members that directly follow it belong to the group, and a blank line ends the group before the next statement of another kind. Consecutive declarations or first bindings, consecutive expression statements outside a group, and the first statement of a block need none.

| Why |
|---|
| a body without them is read line by line, its reader cannot see where one step ends and the next begins, and with the places left open every review argues over them. |

## Dead code

### dead-code-deleted · MUST

Dead code is deleted. No file, dependency, export, parameter, variable or label is unused and no statement is unreachable; production code that only the specs reach is unused too. A parameter a contract or a framework imposes, spelled in its language's form for one left unused, is exempt, and so are an export a package offers to other packages through the entry it publishes and a type that names a part of an exported function's signature — its parameter object, its result — though only specs import it.

| Why |
|---|
| dead code is read, kept and feared by people who cannot know it does nothing; the type of a signature's part is the contract a caller writes its value against, used wherever the function is. |

### feature-flag-retired-once-settled · SHOULD

A feature flag is retired once it settles. It is a setting with an issue that names when it goes; once it serves one value everywhere, it is removed with the branch it no longer takes.

| Why |
|---|
| a flag that serves one value everywhere is a branch that never runs, and it hides from every tool because it is still read. |
