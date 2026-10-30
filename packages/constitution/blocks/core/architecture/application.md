# Application

> Governs the use cases: what they do, what they decide, how they are cut.

## The vocabulary

- **Use case.** An application service: an operation the feature offers. It loads through its repositories, asks the model to decide, saves, and publishes the events the model yielded; the rules it applies live in the model.

## Use cases

### operation-has-a-use-case · MUST

Every operation a feature offers, a read included, has its use case in the application layer, however thin: a query's may only ask its repository; the steps it gains later go there, and the rules it gains go to the model.

| Why |
|---|
| the application then lists everything the feature does, in the same form for every interface that offers it, and a step added to a read reaches every interface without touching their bindings. |

### use-case-leaves-decisions-to-the-model · MUST

A use case orchestrates; the model decides. It holds only the application's own rules — who may act, what to load, the order of steps, the transaction — and each branch on an aggregate's state or on a business value is a call into the model: a transition, a domain service, a predicate of an entity. It branches only on what a port answered, on who acts, and on a failure the model raised.

| Why |
|---|
| a rule written in a use case is skipped by the next use case that changes the same aggregate, and the model is left holding the data while the rules live nowhere. |

### domain-and-application-log-nothing · MUST

The domain and the application log nothing: a use case returns its result or throws its expected failure, or publishes an event, and a binding or delivery unit logs what happened, a failure the use case handled included.

| Why |
|---|
| the core of the program would decide what an operator is told, which is its caller's to know. |

## Commands and queries

### command-loads-through-its-write-port · SHOULD

A command loads the aggregates it decides on through its ports of the write side, and decides only through them and its input.

| Why |
|---|
| what a command changes it must load to keep its invariants, and loading it through the write side keeps the command blind to the read side. |

### command-returns-nothing · SHOULD

A command returns nothing; an expected failure is thrown, and the caller makes the identifier of what the command creates and passes it in.

| Why |
|---|
| a command that returns data is half a query, and an identifier the caller makes lets it retry the command safely. |

### query-and-command-apart · MUST

Where a feature splits its **read side** from its **write side**, the two never import each other, directly or through a surface that joins them.

| Why |
|---|
| reads and writes change for different reasons and scale differently. |

## Pipelines

### pipeline-stages-run-by-their-owner · SHOULD

A pipeline's stages live in the `steps/` of the use case or domain service that runs them, in the order it calls them, and no stage calls another; a stage of a use case decides nothing — its decisions are calls into the model.

| Why |
|---|
| the owner reads as the pipeline, a stage is added, removed or tested alone, and a rule hidden in a use case's stage is skipped by every other use case. |
