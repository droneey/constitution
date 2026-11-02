# Access control

> Governs a cache that outlives no session.

## Sessions

### cache-cleared-when-the-session-ends · MUST

A cache of one person's remote data is cleared when the session ends. It is cleared in memory and where it persists, and also when another person signs in.

| Why |
|---|
| the cache holds what the last person was allowed to read, and the next person on the device otherwise sees it. |
