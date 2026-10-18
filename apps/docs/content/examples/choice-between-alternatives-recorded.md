```md
## Postgres stores the orders · 2026-10-02

Chosen: Postgres, for transactions across an order and its payments.

Rejected:
- MongoDB: an order and its payments would need a two-phase write.
- SQLite: the orders service runs on three hosts that share one store.
```
