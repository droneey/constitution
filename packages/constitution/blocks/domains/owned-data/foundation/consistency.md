# Consistency

> Governs concurrent changes to the stored data, the invariants the store holds and what a read sees of its caller's own writes.

## Concurrent changes

### data-a-write-decides-on-carries-its-version → write-on-read-data-is-conditional · MUST

Data a write decides on, read by an earlier request, carries a version. That is a stored record, or the set of records the program keeps consistent as one, which carries one version for the whole set, checked and moved by every write to any of its records; the store checks the version on that write, and a write made on an older version is refused as a conflict.

| Why |
|---|
| no lock outlives a request, so only a version the data carries shows that what one request read changed before the next request writes, and a version per record of a set kept consistent as one lets two writers change two of its records, each passing its own check, into a state the set forbids — optimistic concurrency control. |

## Reads

### read-sees-its-callers-own-writes · MUST

A read sees its caller's own writes. Where the store it reads may lag behind the writes, a read of what its caller just wrote reads from a store that does not lag behind that write, or waits until the version that write saved has reached it.

| Why |
|---|
| a read of its caller's own write from a store that lags shows the user a change they just made as not made — read-your-writes consistency. |

## Invariants

### invariant-also-held-by-the-store · MUST

An invariant the store can hold is also held by the store, where the transaction that could break it commits. An invariant over a set of records — a uniqueness among them — holds there by a constraint of the store or a reservation, and the code that writes maps its violation to an expected failure of the program's own; a check in the code made before the commit only answers earlier. Any other invariant the store can express — a reference, a required value, a range — is declared in the store as a constraint too, beside the check in the code.

| Why |
|---|
| two concurrent transactions each pass the code's check, each having seen the invariant hold, and store together what it forbids, since only the store sees their writes together; a violation left unmapped reaches the caller as a defect instead of the failure it can act on. |
