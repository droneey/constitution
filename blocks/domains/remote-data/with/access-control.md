# Remote data with access control

> Governs a cache that outlives no session.

## Sessions

### cache-cleared-when-the-session-ends · MUST
A cache that holds one signed-in person's remote data, as a client's does, is cleared, in memory and persisted, when the session ends or another person signs in.

| Why | Tags |
|---|---|
| the cache holds what the last person was allowed to read, and the next person on the device otherwise sees it. | [security, data] |
