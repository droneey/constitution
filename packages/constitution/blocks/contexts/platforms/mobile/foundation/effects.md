# Effects

> Governs the effects of an app on a phone or tablet: its background work.

## Calls and resources

### background-work-handed-to-the-systems-scheduler → async-work-awaited-or-held-by-a-scope · MUST

Work that must finish after the app leaves the foreground is handed to the system's scheduler of background work. Such work — an upload, a sync, a queued write — is never left to a timer or a task of the app the system suspends.

| Why |
|---|
| the system suspends and ends an app in the background without warning, and work no scheduler holds stops with it, half done. |
