# Functions

> Governs a function.

## Purpose

### function-does-one-thing · SHOULD

A function does one thing, at one level of abstraction. It calls steps named for what they do, or does one step itself.

| Why |
|---|
| a function that does two things cannot be named for what it does, nor tested or reused for one of them without the other. |

### function-answers-or-changes · SHOULD

A function either answers a question or changes state, never both. One that answers changes nothing, and one that changes state decides only on its input, on what it changes and on the facts it asks of the dependencies it is handed. An atomic operation that reports the outcome of its own change — a compare-and-set, a take from a queue — is one change.

| Why |
|---|
| a change that reads more than it changes decides on data its caller never saw, and a question that changes something cannot be asked twice safely — command–query separation. |

### function-answers-from-its-input-and-handed-dependencies · SHOULD

A function that answers depends only on its input and on the dependencies it is handed. Such a dependency is a clock, a configuration, a store; the time and the configuration reach a function as input or through such a dependency, never read from where it runs.

| Why |
|---|
| a function that reads the time or the configuration from where it runs answers differently on each machine and each run, so a spec cannot pin its answer and a caller cannot see what it depends on. |

## Size and flow

### function-within-its-limits · MUST

A function holds at most 100 lines and a cognitive complexity of at most 15. A function whose body is one data literal it returns — a table, a drawing — may lift the line limit by a suppression that says so; test code, which the tests chapter defines, and a generated file have no line limit.

| Why |
|---|
| past these sizes a function no longer fits in a reader’s head, so a change to it is made without seeing all it does, and a limit that only warns is ignored. |

### function-leaves-early-on-failure · SHOULD

A function leaves its failure paths first, through guard clauses, so its main path stays at the top level of indentation. A genuine hierarchy — a parser, a tree walk — is exempt.

| Why |
|---|
| each level of nesting is one more condition a reader must hold while reading a line, so a main path buried under them is the one most often misread. |

## Parameters

### function-takes-at-most-three-positions · SHOULD

A function takes at most three positional parameters, and none for the parts of one whole. Values that make one whole — the fields of an order, the options of a call — are named at the call site, whatever their number: as one named object, or as keyword arguments where the language has them; a signature a framework imposes is exempt.

| Why |
|---|
| a caller must remember the order of every position and swaps two of them unseen, and each new position changes every call, while a value named at the call site says what it is and a new one is added without touching its callers. |

### function-takes-no-boolean-position · SHOULD

A function takes no boolean by position. The call site names the flag — a field of the call's object, or a keyword argument where the language has them —, or the function becomes two that each say what they do.

| Why |
|---|
| a bare `true` or `false` at a call site says nothing of what it switches, so a reader must open the function to read the call, and a flag passed the wrong way reads as correct. |

### function-tells-same-type-parameters-apart · SHOULD

A function tells apart the parameters that share a type. It takes them as one named object or gives each a type of its own; an operation whose operands play one role — a comparison, a combiner — takes them in order.

| Why |
|---|
| two values of one type in a row compile either way round, so a call that swaps them passes every check and does the wrong thing. |
