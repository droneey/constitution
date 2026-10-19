# Effects

> Governs background work.

## Calls and resources

### background-work-handed-to-the-systems-scheduler → async-work-awaited-or-held-by-a-scope · MUST

Work that must finish after the app leaves the foreground — an upload, a sync, a queued write — is handed to the system's scheduler of background work, never left to a timer or a task of the app it suspends.

| Why | Tags |
|---|---|
| the system suspends and ends an app in the background without warning, and work no scheduler holds stops with it, half done. | [data, errors] |
