# Remote data with access control

> Governs a cache that outlives no session.

## Sessions

### cache-cleared-when-the-session-ends · MUST
The cache of remote data, in memory and persisted, is cleared when the session ends or another person signs in.

| Why | Tags |
|---|---|
| the cache holds what the last person was allowed to read, and the next person on the device otherwise sees it. | [security, data] |
