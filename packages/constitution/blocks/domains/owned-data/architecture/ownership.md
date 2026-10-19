# Ownership

> Governs who reads and writes a feature's stored records.

## General

### feature-owns-its-stored-records · MUST

A feature's stored records — its tables, collections, keys — are read and written only by its own adapters; another feature reaches them only through the owner's operations, composed in composition, never by a query, a join or a view over them.

| Why | Tags |
|---|---|
| a query over another feature's records couples the two through the store, where no import rule sees it, and the owner can no longer change its schema alone. | [data] |

### feature-records-in-a-namespace-of-their-own · SHOULD

Each feature's records live in a schema or namespace of their own, reached, where the store grants access by namespace, by a role granted that namespace alone.

| Why | Tags |
|---|---|
| the store then refuses what the rule forbids, and a reader sees from the name which feature owns a record. | [data, security] |
