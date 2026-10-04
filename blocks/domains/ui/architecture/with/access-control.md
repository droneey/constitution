# User interface with access control

> Screens some users may not open: where a screen is guarded, and how a feature learns the permissions it adapts to.

## screen-guards-through-auth-surface → access-denied-unless-granted
Guards and redirects of a screen live in the screens layer and use the surface of the feature that owns sessions; a feature's screens adapt to permissions passed down by composition.

| Why | Check | Tags |
|---|---|---|
| access is decided before the screen renders, in one layer, and no feature reaches into the session's internals. | review | [] |
