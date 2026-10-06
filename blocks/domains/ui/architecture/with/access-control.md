# User interface with access control

> Screens some users may not open: where a screen is guarded, how a feature learns the permissions it adapts to, and where the client keeps whether a session exists.

### screen-guards-through-auth-surface → entry-point-declares-its-access
Guards and redirects of a screen live in the screens layer and use the surface of the feature that owns sessions; a feature's screens adapt to permissions passed down by composition.

| Why | Tags |
|---|---|
| access is decided before the screen renders, in one layer, and no feature reaches into the session's internals. | [] |

### session-presence-in-a-root-store → client-concerns-in-root-built-stores
Whether a session exists is one of the global concerns the client owns, in a small store the root builds; what the session carries — the user, their rights — keeps the home of the data it is.

| Why | Tags |
|---|---|
| every screen asks one place whether someone is signed in, and the user's details are not copied into a store beside their real home. | [] |
