# Code

> Governs any code no other chapter governs.

## Vocabulary

The **repository**, the repository of files, is the project's files, however they are kept.

A thing's **source** is what it is derived from and what a change to it goes to: a fact's one home, a generated file's input, the code a package is built from.

A **person** is a human, as against a program or an agent (as the agents chapter defines one).

A program's **user** is whoever uses it: a person, a script or another program.

A program's **operator** is whoever runs it and keeps it running where it is hosted, a person or another program.

A **task** is the work a person asks to be done on the repository, carried out by one or more changes.

A **present need**{#present-need} is a concept of the business, a place where the program meets something outside it or a value that passes there, a point where a behaviour is replaced for a test, or a rule that asks for the structure.

A spec, a case and test code are what the tests chapter defines.

The **blank-line places**{#blank-line-places}, a default, are the places around a compound statement, such as a condition, a loop, a switch or a try, around a statement that deletes a key or a binding, and around a function, declared or held by a variable; before a statement that ends a path, such as a return, a raise, a break or a continue, and after one that code follows; and before a declaration, or a first binding in a language that declares none, that follows another kind of statement, and after the group it opens, which holds the calls and assignments on what it declares that directly follow it. Every other place is none, such as one between consecutive declarations, between consecutive expression statements outside a group, or before the first statement of a body.

A **structure** is an abstraction, a pattern, a shared module or a level of indirection.

## Responsibility

### fact-has-one-source · MUST

Each fact has one source. A value, a rule of the business or a piece of state has one home, and everything else reads it or derives from it; a copy kept for speed is rebuilt from its source, and a figure a document or a message reports about the program's data is computed from that data.

| Why |
|---|
| two copies of one fact drift apart, and the program is then wrong in one of them — a single source of truth. |

### copy-kept-for-speed-marked-derived · SHOULD

Every copy of a fact kept for speed is marked as derived from its source.

| Why |
|---|
| an unmarked copy is taken for the fact's home and changed there, and the next rebuild from the source undoes the change. |

### structure-appears-only-on-a-present-need · SHOULD

Every structure appears only when a present need demands it. One that only forwards, restates or anticipates is removed. Exempt: a file that only re-exports, an implementation of one part's contract that calls another part or something outside the program, and the one door a part offers for each of its operations, through which every caller reaches it.

| Why |
|---|
| a structure made in advance guesses its axis and is torn out before it fits, and a unit that only forwards adds a file to read and change for nothing — you aren't gonna need it. |

### present-need-gets-its-structure · SHOULD

Every present need that demands a structure has one, kept while the need stands. A concept or a decision left as a plain string, a flag or a repeated branch is a structure missing.

| Why |
|---|
| a need with no structure of its own is handled again wherever it is met, and each copy of the handling drifts from the others. |

### copies-joined-when-they-change-together · SHOULD

Look-alike copies of code are joined only when they change together, and only at their third occurrence. Exempt: two copies of one piece of knowledge, which are one fact and are joined at once.

| Why |
|---|
| an abstraction drawn over code that only looks alike guesses an axis two cases cannot show, and is torn apart when the copies change apart — the rule of three. |

## Clarity

### code-reads-plainly · MUST

All code takes the longer, plain form over the terse, clever one. It holds no nested conditional expression, no trick a reader has to decode and no assignment inside a condition. Exempt: a binding form the language made for testing the value it binds.

| Why |
|---|
| a terse, clever line saves its author a minute and is misread by every later reader, whose change then breaks what they did not decode — keep it simple. |

### statements-grouped-by-blank-lines · MUST

Every body's steps are set apart by a blank line at each blank-line place. A blank line elsewhere is neither required nor forbidden.

| Why |
|---|
| a body without them is read line by line, its reader cannot see where one step ends and the next begins, and with the places left open every review argues over them. |

## Dead code

### dead-code-deleted · MUST

All dead code is deleted. No file, dependency, export, parameter, variable or label is unused and no statement is unreachable, and production code that only test code reaches counts as unused. Exempt: a parameter a contract or a framework imposes, spelled in its language's form for one left unused; an export a package offers through its published entries; and a type that names a part of an exported function's signature, such as its parameter object or its result, though only test code imports it.

| Why |
|---|
| dead code is read, kept and feared by people who cannot know it does nothing, while the type of a signature's part is the contract a caller writes its value against. |
