# Transactions

> Governs the transactions that change the program's aggregates.

## General

### transaction-changes-one-aggregate · SHOULD

A transaction changes one aggregate; a change that spans several reaches the others afterwards, by an event or a later step, each in a transaction of its own.

| Why |
|---|
| a transaction over several aggregates locks them together and binds their consistency into one, which their boundaries were drawn to keep apart. |
