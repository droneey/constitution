# User interface

> Governs what a cache must offer for optimistic writes.

## Requirements for implementation

### cache-undoes-only-the-failed-writes-change · MUST

The cache undoes only a failed write's own change. It lets a write change its entries before the write runs, and when the write fails undoes that write's change alone — by rendering pending writes from their inputs, or by restoring and reapplying the writes still pending.

| Why |
|---|
| a cache that cannot undo one write's change leaves the program no way to take back a refused change but to drop its whole state, and one that also undoes the other writes still pending drops changes that still stand. |

### cache-exposes-the-input-of-pending-writes · MUST

The cache gives the input of every write still pending.

| Why |
|---|
| without the input of a pending write, an item the remote system has not yet created appears only once the write settles, and the user's action looks lost until then. |
