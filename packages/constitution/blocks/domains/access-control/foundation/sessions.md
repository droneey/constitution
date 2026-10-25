# Sessions

> Governs a session's lifetime.

## Lifetime

### session-renewed-at-sign-in · MUST

A session gets a new identifier at sign-in and whenever its rights rise, and the one it had is invalidated.

| Why |
|---|
| an identifier planted before sign-in otherwise becomes, at sign-in, a session the attacker already holds. |

### session-ended-on-the-server-at-sign-out · MUST

A session ends on the server at sign-out: its identifier, and its refresh tokens where it issues them, are refused from then on, whatever copy of them survives on a client.

| Why |
|---|
| a sign-out that only forgets the token on the client leaves a stolen copy working. |

### sessions-ended-when-credentials-change · MUST

A change of password, a reset, an account recovery and a change or removal of a factor end the account's other sessions and revoke its refresh tokens, where it issues them.

| Why |
|---|
| the person who changes a credential is often shutting out someone who took the old one, and a session left open keeps them in. |

### access-change-reaches-every-session-and-token · MUST

A disabled or deleted account loses its sessions, its refresh tokens where it issues them, and its keys at once; a revoked right is read from the store by every session and key the server keeps on the next request that needs it, and left out of every token issued after it; an access token checked without the store lives only minutes.

| Why |
|---|
| a person removed from a team otherwise keeps their access until a long-lived token expires, which is the window an insider uses. |

### session-has-idle-and-absolute-limits · SHOULD

A session ends after a time without activity and after a time since sign-in, both set by the project.

| Why |
|---|
| a session with no end works for ever for whoever finds an unlocked device or a stolen token. |

### sessions-listed-and-ended-by-their-owner · SHOULD

A person can see their active sessions and, after proving a factor again, end any or all of them; an administrator can end a person's sessions.

| Why |
|---|
| a person who lost a device or sees a sign-in they never made can otherwise only wait for the session to expire. |
