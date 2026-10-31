# Access control

> Governs guards of screens and the session they read.

## Guards

### screen-guarded-through-the-session-owners-surface → entry-point-declares-its-access · MUST

A screen's guards and redirects live in the screen's registration in the root and use the surface of the feature that owns sessions.

| Why |
|---|
| access is decided before the screen renders, in one place, and no feature reaches into the session's internals. |

## Session state

### session-presence-kept-in-a-root-store · MUST

Whether a session exists is one of the global concerns the client owns, in a small store the root builds; what the session carries — the user, their rights — keeps the home of the data it is.

| Why |
|---|
| every screen asks one place whether someone is signed in, and the user's details are not copied into a store beside their real home. |
