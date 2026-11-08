# Reads

> Governs the store a read reaches, how far it may lag behind the commands, what answers a command, and how a projection is written, read and rebuilt.

## Vocabulary

A **projection** is a read model kept apart in a store, fed by the write side's events and rebuilt from what the write side stores.

A **projection port** is a data port, as the repositories chapter defines it, through which a feature's command writes a projection, one aggregate at a time at the version that aggregate reached: its state, as a rebuild loaded it, or an event, as a reaction, in core's composition chapter's sense, was handed it.

## Lag

### only-a-queries-ports-store-lags · MUST

Only a queries port's store may lag behind the commands. Every repository reads a store that never lags behind them, while a queries port may read one that does, as a replica or an index does.

| Why |
|---|
| a repository that read a store that lags would decide a command on a state already changed, and answer a fact its command needs, such as whether a name is taken, from before the change that took it — command–query responsibility segregation. |

### command-answered-from-a-read-consistent-with-it · MUST

Every delivery unit that answers a command with what it started reads it from a store consistent with the write: it runs the command, then a query of that store. Where no such store answers, it answers that the command was accepted.

| Why |
|---|
| a read from a store that lags answers that what the command started does not exist, and its caller retries a change that already landed — read-your-writes consistency. |

## Projections

### projection-written-by-its-features-reaction · SHOULD

Every projection a feature keeps is written by its own reaction to its events, a command that writes through a projection port. Exempt: the command that rebuilds it from what the write side stores.

| Why |
|---|
| a projection written by the command that made the change ties the write to the reads' store, and one written by another feature's code changes whenever that feature does — command–query responsibility segregation. |

### projection-read-only-by-the-read-side · MUST

Every projection is read only by the adapters of the read side's queries ports.

| Why |
|---|
| a command that reads a projection decides on data that lags behind the write it is about to make — command–query responsibility segregation. |

### projection-write-applied-only-if-newer · MUST

Every projection write takes effect only if its aggregate version is newer than the one the projection holds of it. A write at that version or an older one does nothing.

| Why |
|---|
| an event is handed on at least once, so one handed on again after its write landed, as after a lost acknowledgement, writes its change a second time, and a total it feeds counts it twice — the idempotent receiver. |

## Rebuilds

### projection-rebuilt-from-what-the-write-side-stores · MUST

Every projection is rebuilt from what the write side stores, by a command of its feature. The command loads each aggregate, a bounded page at a time, through its repository, and writes its state, at its version, through the projection port.

| Why |
|---|
| events are handed on and then need not be kept, so a projection that only they could rebuild is lost when its shape changes, while what the write side stores outlives every hand-on and serves an aggregate stored as its events as well. |

### projection-rebuild-starts-from-an-empty-projection · MUST

Every projection's rebuild starts from an empty projection, never over what it already holds.

| Why |
|---|
| a rebuild over a projection that holds its aggregates writes each at a version already stored, so every write does nothing and the shape the rebuild was run for never lands. |

### projection-rebuild-writes-alone-while-it-runs · MUST

Every projection's rebuild is the only writer of the projection it builds while it runs. Its reaction's events for that projection wait, in order, until it is done.

| Why |
|---|
| an event written into a projection the rebuild has not yet reached finds nothing to change, and the rebuild then writes the state it loaded before that event, so the projection misses the change for good. |

### projection-rebuilt-beside-the-live-one · MUST

Every projection rebuilt while its queries are served is rebuilt into a new store beside the live one. The live one goes on answering its queries and taking its events until the switch. Exempt: a projection whose queries are answered as unavailable while it rebuilds, which may be emptied and rebuilt in place.

| Why |
|---|
| a projection emptied and rebuilt in place answers its queries with a part of its data while it fills, so a list shows half its items and a total counts half its rows, with nothing to tell the reader that the answer is partial. |

### projection-switched-once-caught-up · MUST

Every projection's queries switch to its rebuilt store only once that store has taken every event the live one took. The switch is one step that no query sees half made.

| Why |
|---|
| a switch made before the rebuilt store caught up answers from a projection that misses the changes made while it was built, and one made query by query answers the same question from two projections at once. |

### rebuilt-projection-subscribes-from-the-rebuilds-start · MUST

Every projection being rebuilt takes its events from the position its event stream held as the rebuild began. It takes them through a subscription of its own, none until the rebuild is done; the stream is what hands the events on, such as the event outbox's relay or a broker, and no event waits in the program's memory.

| Why |
|---|
| a subscription that starts after the rebuild began misses the events in between for good, while one that buffers them in memory loses them when the program stops mid-rebuild, and a replay from the start position is harmless, since a projection write at an old version does nothing. |
