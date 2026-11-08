# Transactions

> Governs where a transaction of the program's store is opened and what it spans.

## General

### transaction-opened-at-the-edge · SHOULD

Every transaction of the program's store lies within one call of a data port's adapter or one step of an edge worker. It is never opened around a use case, nor kept open across a call to another adapter.

| Why |
|---|
| a transaction opened around a use case holds its locks across the use case's other calls, a call to another system among them, spans the commands of several features when a composition command is wrapped, and ties the use case to the store's mechanism its ports hide, while a save with a version check needs no transaction beyond its own write — the unit of work pattern. |
