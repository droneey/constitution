# Effects

> Governs the effects of an app on a phone or tablet: its background work.

## Calls and resources

### background-work-handed-to-the-systems-scheduler → async-work-awaited-or-held-by-a-scope · MUST

Every piece of work that has to finish after the app leaves the foreground goes to the system's background scheduler. It is never left to a timer or a task of the app, which the system suspends with the app; such work includes an upload, a sync and a queued write. Exempt: work the system keeps running in a mode it grants for that kind of work, such as playing audio, guiding along a route or holding a call.

| Why |
|---|
| the system suspends and ends an app in the background without warning, and work no scheduler holds stops with it, half done. |
