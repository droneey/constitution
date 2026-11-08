# Repositories

> Governs the data ports through which a use case loads, saves and reads what the program stores, the races a save meets, the outside identifiers it keeps, and the rebuild of an aggregate from what is stored.

## Vocabulary

A **data port** is a port through which a use case reaches the data the program's store keeps, in the domain model's words, such as a repository, this data port and not core's repository of files, through which a command loads and saves an aggregate, a **queries port**{#queries-port}, through which a query reads, and a unit-of-work port.

A **unit-of-work port** is a data port through which a command saves several aggregates of its feature, with their events, in one write.

A repository's name is its aggregate's followed by the word **`Repository`**{#repository-suffix}, and a queries port's by the word **`Queries`**{#queries-suffix}, each just before the role word `Port` that ends every port's name: `OrderRepositoryPort`, `OrderQueriesPort`. Both words are defaults.

A **lost race** is a command's write conflict, as the consistency chapter defines one, met because the store changed since the command read it: its aggregate version moved on since its load, or a create's identifier or unique value was stored meanwhile. A lost race is transient, as core's errors chapter defines it, and a command's other write conflict is a clash, as core's application chapter defines one.

## Data ports

### repository-serves-one-aggregate · MUST

Every repository serves one aggregate through its aggregate root, and never an inner entity, a table or a feature.

| Why |
|---|
| a repository that serves an inner entity, a table or a whole feature lets a command load and save past the root that keeps the aggregate's invariants — the repository pattern. |

### stored-aggregate-has-one-repository · MUST

Each aggregate the program stores has one repository.

| Why |
|---|
| two repositories of one aggregate load and save it two ways, so a change made through one is not checked or versioned as the other expects. |

### repository-answers-only-its-commands-facts · SHOULD

Beside storing its aggregate, every repository answers only the facts the aggregate's commands need. Whether an email is taken or a slot is free are such facts.

| Why |
|---|
| a repository that also serves screens grows an operation for every list a screen shows and ties every command to the reads' store — the repository pattern. |

### repository-stores-whole-aggregates · MUST

Every repository loads, saves and removes an aggregate whole. It offers no operation that changes or removes one part of it in the store — a field, a status, an inner entity.

| Why |
|---|
| a change the store applies to one part skips the transition that checks it, and the invariant then holds only in the code that remembered it — the repository pattern. |

### repository-saves-the-aggregate-with-its-events → write-lands-whole · MUST

Every save or removal of an aggregate takes it with the events its transitions yielded and keeps both in one write. A repository or a unit-of-work port makes it, and no other code keeps a domain event.

| Why |
|---|
| events kept apart from their change are lost, or announce a change the store does not hold, when the program stops between the two writes — the transactional outbox. |

### aggregates-saved-together-through-a-unit-of-work · MUST

Every command that saves several aggregates of its feature in one write does so through a unit-of-work port its feature declares.

| Why |
|---|
| several repositories saved one after another are kept half when the program stops between them, and a transaction opened around them by the use case ties it to the store's mechanism — the unit of work pattern. |

### queries-port-never-loads-through-a-repository · SHOULD

Every queries port returns aggregates, entities, value objects and read models, and never loads through a repository.

| Why |
|---|
| a queries port that loads through a repository reaches the commands' store and its save, so the reads can no longer move to another store — command–query responsibility segregation. |

### data-port-named-by-its-word · SHOULD

Every repository and every queries port is named after what it serves and by its kind's word. A repository serves its aggregate, and a queries port the aggregate it reads or, where it reads several, its feature. The word of what it serves is in the singular, as `Order` and never `Orders`, and its kind's word, `Repository` or `Queries`, stands just before its role word: `OrderRepositoryPort`, `OrderQueriesPort`.

| Why |
|---|
| a data port named off its word hides which side it serves, and the check that keeps the sides apart by the names they import passes it. |

## Races

### aggregate-saved-only-if-unchanged-since-loaded → write-on-read-data-is-conditional · MUST

Every stored aggregate is saved by its repository only if the stored version is still the one it was loaded at. The aggregate carries the version it was loaded at and the version its transitions reached, and the repository checks the first, stores the second and sets neither.

| Why |
|---|
| two commands that load one aggregate and save it in turn lose the first one's change without a trace — optimistic concurrency control. |

### raced-create-never-overwrites · MUST

Every save of a new aggregate whose identifier or unique value the store already holds fails, never overwriting what is stored.

| Why |
|---|
| two commands that each find an identifier or a value free both save, and a create that overwrites wipes out the aggregate the first one stored — optimistic concurrency control. |

### lost-race-fails-as-a-transient-conflict · MUST

Every save that loses a race fails as a lost race, a transient expected failure. Its repository's adapter maps the store's failure to it, a failure of uniqueness included, never to a defect.

| Why |
|---|
| a lost race met as a defect ends work that a run from a fresh load would complete, or find already done, and one met as a lasting refusal turns a moment's race into a failure its caller shows — optimistic concurrency control. |

### lost-race-run-again-from-its-load · MUST

Every command no saga calls that loses a race is retried only from its load, deciding again on what is now stored. It never saves again the state it decided on before.

| Why |
|---|
| a retry that saves again what it decided on stale data overwrites the change it lost to, while one run from its load either decides afresh or, for a repeated start, changes nothing — optimistic concurrency control. |

## Outside identifiers

### outside-identifier-saved-beside-the-callers · MUST

Wherever the program stores the aggregate its command starts, every identifier an outside system mints for it is saved beside the caller's. The port to that system reports the identifier as the outcome of the change, and the use case saves it through the aggregate's repository, for a query to read; a follow-up the user needs at once, such as the address of a payment page or a booking's confirmation code, is saved the same way.

| Why |
|---|
| an outside identifier the command returned would make it half a query, and one kept nowhere leaves no query able to find what the outside system made. |

## Rebuild from storage

### rebuild-from-storage-checks-only-the-invariants → invariant-checked-at-construction · MUST

Every rebuild from storage checks the invariants of what is stored and no precondition. A stored aggregate that breaks an invariant fails as a defect of corrupt data, never as a refused move.

| Why |
|---|
| a rebuild that checks a precondition refuses data the business once allowed, and corrupt data passed off as a refusal is shown to a user who can do nothing about it. |

### rebuild-from-storage-called-only-by-its-adapters · MUST

Every aggregate's rebuild from storage is called only by the adapters that rebuild it from storage, its repository's and a queries port's. Exempt: a spec and its fixtures, which call what they prove or build.

| Why |
|---|
| a use case that builds an aggregate through its rebuild skips the precondition its starting transition checks, and makes a state the business never allowed. |
