# Sessions

> Governs a session: when it is renewed and ended, how it reads a revoked right, and the sessions a person or an administrator sees and ends.

## Renewal

### session-renewed-at-sign-in · MUST

Every session gets a new identifier at sign-in and whenever its rights rise, and its old identifier is invalidated.

| Why |
|---|
| an identifier planted before sign-in otherwise becomes, at sign-in, a session the attacker already holds. |

## Ending

### signed-out-session-ended-on-the-server · MUST

Every session its person signs out of ends on the server. Its identifier and its refresh tokens are refused from then on, whatever copy its caller still holds.

| Why |
|---|
| a stolen copy outlives every end only the caller's side sees, so a sign-out that clears only the caller's copy shuts out nobody who took one. |

### credential-change-ends-the-accounts-other-sessions · MUST

Every change of an account's credentials ends the account's other sessions on the server. Such changes are a change of password, a reset, a recovery and a change or removal of a factor, and the ended sessions' identifiers and refresh tokens are refused from then on, whatever copy a caller still holds.

| Why |
|---|
| whoever changes a credential is often shutting out someone who holds a session, and a session that survives the change keeps that someone in. |

### removed-account-loses-every-session-at-once · MUST

Every account disabled or deleted loses every session, refresh token and issued key at once. Each is refused on the server from then on.

| Why |
|---|
| a removed person who keeps a session or an issued key keeps the access their removal was meant to end. |

### session-ends-when-idle · MUST

Every session ends after a time without activity that the project sets.

| Why |
|---|
| a session with no idle end works for whoever finds an unlocked device long after its person left it. |

### session-ends-at-an-absolute-limit · MUST

Every session ends after a time since sign-in that the project sets, whatever its activity.

| Why |
|---|
| a session kept alive by its activity alone works for ever for whoever holds a stolen token and keeps using it. |

## Rights

### revoked-right-read-on-the-next-request · MUST

Every session and issued key the server keeps reads a revoked right from the store on the next request that needs it. A message on an open connection is such a request too.

| Why |
|---|
| a right cached in a session otherwise outlasts its revocation by that session's life, which is the window an insider uses. |

## Owners

### own-sessions-listed-to-their-person · SHOULD

Every person can see their own active sessions.

| Why |
|---|
| a person who sees no list of their sessions cannot notice a sign-in they never made. |

### own-sessions-ended-by-their-person · MUST

Every person can end any or all of their own sessions, after proving a factor again.

| Why |
|---|
| a person who lost a device or sees a sign-in they never made can otherwise only wait for the session to expire. |

### persons-sessions-ended-by-an-administrator · MUST

Every person's sessions can be ended by an administrator.

| Why |
|---|
| a person who can neither reach nor recover their account otherwise has no one who can shut out the session that holds it. |
