# Sessions

> Governs a session: when it is renewed and ended, how it reads a revoked right, and the sessions a person or an administrator sees and ends.

## Renewal

### session-renewed-at-sign-in · MUST

Every session gets a new identifier at sign-in and whenever its rights rise, and its old identifier is invalidated.

#### Why

An identifier planted before sign-in otherwise becomes, at sign-in, a session the attacker already holds.

#### Examples

```pseudo title="Avoid"
# accounts/application/use-cases/commands/sign-in.use-case
function startSession(account, presentedSessionId, sessionStore, context)
  sessionStore.attach(presentedSessionId, account.id, context)   # the id from before sign-in lives on

  return presentedSessionId
```

```pseudo title="Prefer"
# accounts/application/use-cases/commands/sign-in.use-case
function startSession(account, presentedSessionId, sessionStore, context)
  sessionStore.invalidate(presentedSessionId, context)

  return sessionStore.open(account.id, context)
```

## Ending

### signed-out-session-ended-on-the-server · MUST

Every session its person signs out of ends on the server. Its identifier and its refresh tokens are refused from then on, whatever copy its caller still holds.

#### Why

A stolen copy outlives every end only the caller's side sees, so a sign-out that clears only the caller's copy shuts out nobody who took one.

#### Examples

```pseudo title="Avoid"
# accounts/presentation/bindings/commands/sign-out
function onSignOut(request, context)
  return ok().clearCookie("session")   # the server still accepts the old identifier
```

```pseudo title="Prefer"
# accounts/application/use-cases/commands/sign-out.use-case
function createSignOut({ sessionStore, refreshTokenStore })
  return function(input, context)
    let sessionId = context.actor.sessionId

    sessionStore.end(sessionId, context)
    refreshTokenStore.revokeBySession(sessionId, context)

# accounts/presentation/bindings/commands/sign-out
function onSignOut(request, signOut, context)
  call signOut({}, context)

  return ok().clearCookie("session")
```

### credential-change-ends-the-accounts-other-sessions · MUST

Every change of an account's credentials ends the account's other sessions on the server. Such changes are a change of password, a reset, a recovery and a change or removal of a factor, and the ended sessions' identifiers and refresh tokens are refused from then on, whatever copy a caller still holds.

#### Why

Whoever changes a credential is often shutting out someone who holds a session, and a session that survives the change keeps that someone in.

#### Examples

```pseudo title="Avoid"
# accounts/application/use-cases/commands/change-password.use-case
function createChangePassword({ accountRepository, passwordHasher })
  return function(input, context)
    let account = accountRepository.find(context.actor.accountId, context)
    let hash = passwordHasher.hash(input.newPassword)

    accountRepository.save(changePassword(account, hash), context)   # other sessions stay signed in
```

```pseudo title="Prefer"
# accounts/application/use-cases/commands/change-password.use-case
function createChangePassword({ accountRepository, passwordHasher, sessionStore, refreshTokenStore })
  return function(input, context)
    let account = accountRepository.find(context.actor.accountId, context)
    let hash = passwordHasher.hash(input.newPassword)
    let current = context.actor.sessionId

    accountRepository.save(changePassword(account, hash), context)
    sessionStore.endAllExcept(account.id, current, context)
    refreshTokenStore.revokeAllExcept(account.id, current, context)
```

### removed-account-loses-every-session-at-once · MUST

Every account disabled or deleted loses every session, refresh token and issued key at once. Each is refused on the server from then on.

#### Why

A removed person who keeps a session or an issued key keeps the access their removal was meant to end.

#### Examples

```pseudo title="Avoid"
# accounts/application/use-cases/commands/disable-account.use-case
function createDisableAccount({ accountRepository, clock })
  return function(input, context)
    let account = accountRepository.find(input.accountId, context)

    if account is <absent> then
      throw new AccountNotFoundError(input.accountId)

    accountRepository.save(disable(account, clock.now()), context)   # sessions and keys live until they expire
```

```pseudo title="Prefer"
# accounts/application/use-cases/commands/disable-account.use-case
function createDisableAccount({ accountRepository, sessionStore, refreshTokenStore, issuedKeyStore, clock })
  return function(input, context)
    let account = accountRepository.find(input.accountId, context)

    if account is <absent> then
      throw new AccountNotFoundError(input.accountId)

    accountRepository.save(disable(account, clock.now()), context)
    sessionStore.endAll(account.id, context)
    refreshTokenStore.revokeAll(account.id, context)
    issuedKeyStore.revokeAll(account.id, context)
```

### session-ends-when-idle · MUST

Every session ends after a time without activity that the project sets.

#### Why

A session with no idle end works for whoever finds an unlocked device long after its person left it.

#### Examples

```pseudo title="Avoid"
# accounts/domain/session/entities/session.aggregate
function isLive(session, policy, now)
  return now < session.signedInAt + policy.absoluteLimit
```

```pseudo title="Prefer"
# accounts/domain/session/entities/session.aggregate
function isLive(session, policy, now)
  return now < session.signedInAt + policy.absoluteLimit
    and now < session.lastActiveAt + policy.idleTimeout
```

### session-ends-at-an-absolute-limit · MUST

Every session ends after a time since sign-in that the project sets, whatever its activity.

#### Why

A session kept alive by its activity alone works for ever for whoever holds a stolen token and keeps using it.

#### Examples

```pseudo title="Avoid"
# accounts/domain/session/transitions/session.transitions
function touch(session, policy, now)
  return { ...session, expiresAt: now + policy.idleTimeout }   # slides for ever while used
```

```pseudo title="Prefer"
# accounts/domain/session/transitions/session.transitions
function touch(session, policy, now)
  let expiresAt = min(
    now + policy.idleTimeout,
    session.signedInAt + policy.absoluteLimit)

  return { ...session, expiresAt: expiresAt }
```

## Rights

### revoked-right-read-on-the-next-request · MUST

Every session and issued key the server keeps reads a revoked right from the store on the next request that needs it. A message on an open connection is such a request too.

#### Why

A right cached in a session otherwise outlasts its revocation by that session's life, which is the window an insider uses.

#### Examples

```pseudo title="Avoid"
function startSession(account, sessionStore, context)
  return sessionStore.open({ accountId: account.id, rights: account.rights }, context)

function mayRefund(session, context)
  return session.rights.includes(RefundOrders)   # copied at sign-in
```

```pseudo title="Prefer"
function startSession(account, sessionStore, context)
  return sessionStore.open({ accountId: account.id }, context)

function mayRefund(session, rightStore, context)
  return rightStore.rightsOf(session.accountId, context).includes(RefundOrders)
```

## Owners

### own-sessions-listed-to-their-person · SHOULD

Every person can see their own active sessions.

#### Why

A person who sees no list of their sessions cannot notice a sign-in they never made.

#### Examples

```text title="Avoid"
Account settings
  Email      ana@example.com
  Password   [Change password]
```

```text title="Prefer"
Account settings
  Email      ana@example.com
  Password   [Change password]

  Where you're signed in
    Laptop browser, Krakow   this device
    Phone app, Warsaw        2 hours ago
    Tablet browser, Lagos    yesterday
```

### own-sessions-ended-by-their-person · MUST

Every person can end any or all of their own sessions, after proving a factor again.

#### Why

A person who lost a device or sees a sign-in they never made can otherwise only wait for the session to expire.

#### Examples

```pseudo title="Avoid"
# accounts/application/use-cases/commands/end-own-session.use-case
function createEndOwnSession({ sessionStore })
  return function(input, context)
    let session = sessionStore.find(input.sessionId, context)

    if session is <absent> or session.accountId is not context.actor.accountId then
      throw new SessionNotFoundError(input.sessionId)

    sessionStore.end(session.id, context)   # no factor proven again
```

```pseudo title="Prefer"
# accounts/application/use-cases/commands/end-own-session.use-case
function createEndOwnSession({ sessionStore, factorVerifier })
  return function(input, context)
    factorVerifier.verify(context.actor.accountId, input.proof, context)

    let session = sessionStore.find(input.sessionId, context)

    if session is <absent> or session.accountId is not context.actor.accountId then
      throw new SessionNotFoundError(input.sessionId)

    sessionStore.end(session.id, context)
```

### persons-sessions-ended-by-an-administrator · MUST

Every person's sessions can be ended by an administrator.

#### Why

A person who can neither reach nor recover their account otherwise has no one who can shut out the session that holds it.

#### Examples

```text title="Avoid"
Operations on sessions     Caller
  list-own-sessions        the person
  end-own-session          the person
```

```text title="Prefer"
Operations on sessions     Caller
  list-own-sessions        the person
  end-own-session          the person
  end-persons-sessions     an administrator
```
