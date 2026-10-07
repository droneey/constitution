# Functions

> Governs a function.

## Purpose

### function-does-one-thing · SHOULD
A function does one thing, at one level of abstraction: it calls steps named for what they do, or does one step itself.

| Why | Tags |
|---|---|
| a function that does one thing can be named, tested and reused; one that does two is none of these. | [] |

### function-answers-or-changes · SHOULD
A function either answers a question or changes state, never both. One that answers has no effect; one that changes state decides only on its input and on what it changes, and the time and the configuration reach it as input.

| Why | Tags |
|---|---|
| a question that changes something cannot be asked twice safely, and a change that reads more than it changes decides on data its caller never saw. | [] |

### function-pure-by-default · SHOULD
A function's result depends only on its input; it changes none of its arguments, and no effect hides inside an otherwise pure helper.

| Why | Tags |
|---|---|
| a pure function can be understood, tested and moved on its own. | [] |

## Size and flow

### function-within-its-limits · MUST
A function holds at most 100 lines and a cognitive complexity of at most 10. A function whose body is one data literal it returns — a table, a drawing — may lift the line limit by a suppression that says so; a spec has no line limit.

| Why | Tags |
|---|---|
| past these sizes a function stops fitting in a reader’s head, and a limit that only warns is ignored. | [] |

### function-leaves-early-on-failure · SHOULD
A function leaves its failure paths first, through guard clauses, so its main path stays at the top level of indentation; a genuine hierarchy — a parser, a tree walk — is exempt.

| Why | Tags |
|---|---|
| each level of nesting is one more condition a reader must hold while reading a line. | [] |

## Parameters

### function-takes-at-most-three-positions · SHOULD
A function takes at most three positional parameters, and values that make one whole — the fields of an order, the options of a call — travel as one named object, whatever their number. A signature a framework imposes is exempt.

| Why | Tags |
|---|---|
| each position is an order a caller must remember, while one object describes itself at the call site and takes a new field without touching its callers. | [] |

### function-takes-no-boolean-position · SHOULD
A function takes no boolean as a positional parameter: the flag is a named field of the call's object, or the function becomes two that each say what they do.

| Why | Tags |
|---|---|
| `save(user, true)` cannot be read at the call site. | [] |

### function-tells-same-type-parameters-apart · SHOULD
A function whose parameters share a type takes them as one named object or tells them apart by their types; an operation whose operands play one role — a comparison, a combiner — takes them in order.

| Why | Tags |
|---|---|
| two values of one type in a row are swapped silently: `transfer(fromId, toId)` compiles either way round. | [] |
