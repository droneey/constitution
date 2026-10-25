# User interface

> Governs what a cache must offer for optimistic writes.

## Requirements for implementation

### cache-undoes-only-the-failed-writes-change · MUST

The cache lets a write change its entries before the write runs, and undoes that write's own change alone when it fails — by rendering pending writes from their inputs, or by restoring and reapplying the writes still pending.

| Why |
|---|
| an optimistic change with no restore leaves the program showing what the remote system refused. |

### cache-exposes-the-input-of-pending-writes · MUST

The cache gives the input of every write still pending.

| Why |
|---|
| an item the remote system has not yet created is shown from that input, and without it the item appears only once the write settles. |
