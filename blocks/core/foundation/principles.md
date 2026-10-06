# Principles

## The laws

The laws are the only MUST rules of this chapter. Each one is binding in every project; a project lowers one only by an override written with the user's consent.

### illegal-states-unrepresentable · MUST
A value with distinct stages is a union keyed by its state, not a bag of optional fields and flags that allows combinations no stage has.

| Why | Tags |
|---|---|
| a state the type cannot express is a state no code has to handle, and no test has to find. | [] |

### errors-surfaced-never-swallowed · MUST
A caught error is handled, rethrown, or mapped to a typed error. Code branches on an error's type or code, never on its message.

| Why | Tags |
|---|---|
| a swallowed error turns a failure into wrong data that shows up far from its cause, and a message is text a person may reword. | [errors] |

### catch-never-empty → errors-surfaced-never-swallowed
No `catch` block is empty.

| Why | Tags |
|---|---|
| an empty catch swallows every error that reaches it. | [errors] |

### rules-held-by-tools · MUST
A rule a tool can hold is held by one, configured to fail on a violation. A rule no configured tool holds is reviewed, or lowered by an override.

| Why | Tags |
|---|---|
| a rule held only by prose is broken as soon as nobody reads it, and a tool never tires. | [] |

### code-formatted-by-one-formatter · MUST
The files of each language are formatted by one formatter, and a file it would change is a violation.

| Why | Tags |
|---|---|
| a formatter ends every argument about layout, and a diff then shows a change of content, never one of layout. | [] |

### one-reason-per-unit · MUST
Each unit — a function, a class, a file, a module, a layer — has one reason to change.

| Why | Tags |
|---|---|
| a unit with two reasons changes for both, and every change risks the other purpose. | [] |

### one-home-per-datum · MUST
Every datum and every piece of state lives in one place; everything else reads it or derives from it.

| Why | Tags |
|---|---|
| two copies of one fact drift apart, and then the program is wrong in one of them. | [data] |

### extension-by-addition · MUST
A new kind of thing — a vendor, a command, a format, a rule — is added as a new member and its registration, without editing the code that handles the other kinds. A long branch by kind becomes a strategy and a registry.

| Why | Tags |
|---|---|
| code that grows by addition keeps every existing member untouched, so adding one cannot break another. | [] |

### numbers-in-text-from-data → one-home-per-datum
A number shown in a text — a count, a total, a limit — is read from the data it describes, never typed again.

| Why | Tags |
|---|---|
| a number typed twice drifts from its source, and the text then states something the program no longer does. | [data] |

### invariant-checked-at-construction · SHOULD
A value that must keep an invariant is built only through the function that checks it, so a value that exists is valid.

| Why | Tags |
|---|---|
| when the invariant is checked at construction, no caller has to check it again or can forget to. | [] |

### one-writer-per-shared-resource · MUST
Every resource the program shares with its host — a signal's handler, the process's exit code, its working directory, a standard stream — has exactly one writer. A block that brings its own writer for such a resource claims it in a rule; a block whose default writer another active block has claimed yields, and no library or effect writes the resource besides.

| Why | Tags |
|---|---|
| two writers of one resource overwrite each other in an order no one chose, and the result depends on which ran last. | [] |
