# Sessions

> Governs a session's lifetime.

## Lifetime

### session-renewed-at-sign-in · MUST
A session gets a new identifier at sign-in and whenever its rights rise, and the one it had is invalidated.

| Why | Tags |
|---|---|
| an identifier planted before sign-in otherwise becomes, at sign-in, a session the attacker already holds. | [security] |

### session-ended-on-the-server-at-sign-out · MUST
A session ends on the server at sign-out: its identifier or token is refused from then on, whatever copy of it survives on a client.

| Why | Tags |
|---|---|
| a sign-out that only forgets the token on the client leaves a stolen copy working. | [security] |

### session-has-idle-and-absolute-limits · SHOULD
A session ends after a time without activity and after a time since sign-in, both set by the project.

| Why | Tags |
|---|---|
| a session with no end works for ever for whoever finds an unlocked device or a stolen token. | [security] |
