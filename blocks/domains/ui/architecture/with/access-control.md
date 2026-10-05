# User interface with access control

> Screens some users may not open: where a screen is guarded, how a feature learns the permissions it adapts to, and where the client keeps whether a session exists.

## screen-guards-through-auth-surface → access-denied-unless-granted
Guards and redirects of a screen live in the screens layer and use the surface of the feature that owns sessions; a feature's screens adapt to permissions passed down by composition.

| Why | Check | Tags |
|---|---|---|
| access is decided before the screen renders, in one layer, and no feature reaches into the session's internals. | review | [] |

## session-presence-in-a-root-store → view-state-homes
Whether a session exists is one of the global concerns the client owns, in a small store the root builds; what the session carries — the user, their rights — keeps the home of the data it is.

| Why | Check | Tags |
|---|---|---|
| every screen asks one place whether someone is signed in, and the user's details are not copied into a store beside their real home. | review | [] |
