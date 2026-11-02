# Access control

> Governs guards of screens and the session they read.

## Guards

### screen-guarded-through-the-session-owners-surface → missing-refused-or-failed-answered-in-the-presentation · MUST

A screen's guard is decided by the feature that owns sessions. What it decides — whether to admit the user and where to send them — is a binding unit's of that feature, reached through its surface, and the screen's registration applies the answer.

| Why |
|---|
| a guard decided anywhere else repeats the decision wherever a screen needs it and reaches into the session's internals, and one decided after the screen renders shows what it should have refused. |

## Session state

### session-presence-kept-in-a-root-store · MUST

Whether a session exists is kept in a store of its own, which the root builds. It is one of the global concerns the client owns; what the session carries — the user, their rights — keeps the home of the data it is.

| Why |
|---|
| a session's presence asked of several places gives screens different answers, and the user's details copied into a store drift from their real home. |
