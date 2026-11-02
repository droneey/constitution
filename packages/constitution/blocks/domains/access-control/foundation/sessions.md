# Sessions

> Governs a session's lifetime.

## Lifetime

### session-renewed-at-sign-in · MUST

A session gets a new identifier at sign-in and whenever its rights rise, and the one it had is invalidated.

| Why |
|---|
| an identifier planted before sign-in otherwise becomes, at sign-in, a session the attacker already holds. |

### sessions-ended-on-the-server-when-trust-ends · MUST

Sessions end on the server when trust ends. An ended session's identifier and refresh tokens are refused from then on, whatever copy survives on a client. A session ends when its person signs out; a change of password, a reset, an account recovery and a change or removal of a factor end the account's other sessions; and a disabled or deleted account loses every session, refresh token and key at once.

| Why |
|---|
| a stolen copy outlives every end only the client sees, and whoever signs out, changes a credential or is removed is often shutting out someone who holds one. |

### revoked-right-read-on-the-next-request · MUST

A revoked right is read from the store on the next request. Every session and key the server keeps reads it there on the next request that needs it, and every token issued after it leaves it out; an access token checked without the store lives no longer than a bound the project sets.

| Why |
|---|
| a right cached in a session or a long-lived token otherwise outlasts its revocation by that token's life, which is the window an insider uses. |

### session-has-idle-and-absolute-limits · SHOULD

A session has an idle limit and an absolute limit. It ends after a time without activity and after a time since sign-in, both set by the project.

| Why |
|---|
| a session with no end works for ever for whoever finds an unlocked device or a stolen token. |

### sessions-listed-and-ended-by-their-owner · SHOULD

A person can see and end their own sessions, and an administrator can end them too. They see their active sessions and, after proving a factor again, end any or all of them; an administrator can end a person's sessions.

| Why |
|---|
| a person who lost a device or sees a sign-in they never made can otherwise only wait for the session to expire. |
