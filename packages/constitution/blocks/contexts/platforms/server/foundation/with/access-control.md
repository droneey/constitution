# Access control

> Governs how a function the client can call on the server meets the access its operation checks.

## Server functions

### server-function-access-checked-on-every-call → operation-access-checked-on-every-call · MUST

A function the client can call on the server has its caller's access checked on every call, by the operation it calls. Such a function — a server function, an action, a loader — reaches what it does only through that operation.

| Why |
|---|
| a function that reaches its work past its operation skips the operation's check, whatever the screen that calls it has hidden — complete mediation. |
