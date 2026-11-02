# Transactions

> Governs what runs inside a transaction of the program's store.

## General

### transaction-holds-no-outside-call → write-lands-whole · MUST

A transaction holds no call outside the program. No call to another system — an HTTP request, a mail, a publish to a broker — runs while a transaction of the program's store is open: what the change needs from outside is asked before the transaction opens, and what it sets off outside runs after it commits.

| Why |
|---|
| a call made inside a transaction is not rolled back with it, so a rollback leaves its effect orphaned at the other side, and the transaction holds its locks for as long as the other side takes to answer. |
