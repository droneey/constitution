# User interface with access control

> Governs guards of screens and the session they read.

## Guards

### screen-guarded-through-the-session-owners-surface → entry-point-declares-its-access · MUST
A screen's guards and redirects live in the screens layer and use the surface of the feature that owns sessions.

| Why | Tags |
|---|---|
| access is decided before the screen renders, in one layer, and no feature reaches into the session's internals. | [security] |

### feature-screens-adapt-to-permissions-passed-down · SHOULD
A feature's screens adapt to the permissions composition passes them, never reaching into the session's internals.

| Why | Tags |
|---|---|
| no feature then knows how sessions work, and a change of the session's model never reaches a screen. | [security] |
