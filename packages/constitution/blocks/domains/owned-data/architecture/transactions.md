# Transactions

> Governs the transactions that change the program's aggregates: what one holds and where it is opened.

## General

### transaction-spans-a-use-case-within-its-feature · MUST

A transaction lies within one use case and one feature, and spans the use case's work on its store whole. A use case splits that work into several transactions only where each transaction leaves every aggregate it saves valid on its own; a process that keeps its state in the store then carries on the rest. Several aggregates of one feature change in one transaction only where one invariant binds them, their locks taken in one order.

| Why |
|---|
| a transaction across features ties their stores and their domain models together, so neither changes or moves apart; one that changes aggregates no invariant binds makes two unrelated changes collide on its locks; locks taken in two orders deadlock; and a use case cut into transactions as they come leaves half its change when it stops between two, with nothing that carries on the rest. |

## Opening

### transaction-opened-at-the-edge · MUST

A transaction is opened and committed at the edge. Where a feature's use case keeps its work in one transaction and makes no call outside the program, a decorator the composition root wraps around the use case opens the transaction. A use case that makes such a call, or splits its work into several transactions, is handed a port of neither side and opens each transaction through it, before that call or after it. A composition module's use case opens none: each feature's use case it calls opens its own.

| Why |
|---|
| a transaction a use case opens on the store itself ties the use case to the store's mechanism its ports hide, so the store can no longer change apart from it. |
