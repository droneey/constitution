# Reads

> Governs the store a query reads from and how far it may lag behind the commands.

## General

### only-a-queries-ports-store-lags → repository-per-aggregate-and-queries-port-for-reads · MUST

Only a queries port's store may lag behind the commands. A repository's store never lags behind them, and a queries port's may, as a replica's or an index's does.

| Why |
|---|
| a repository that read a store that lags would decide a command on a state already changed — command–query responsibility segregation. |
