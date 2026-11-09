# Tokens

> Governs the tokens a caller presents or the program issues, and the keys a machine is issued.

## Vocabulary

An **issued key** is a key or a token the program issues for another program to call it.

## General

### token-verified-before-it-is-trusted · MUST

Every token a caller presents is trusted only after it is checked. A self-contained token is checked by its signature, by the algorithm the program expects, and by its type, issuer, audience and expiry, and one that names another algorithm or none is refused; an opaque token is checked with its issuer, which reports it active, and by the audience and expiry the issuer reports for it.

#### Why

A token whose claims go unchecked is accepted from another issuer, for another service or after it expired, an ID token is passed off as an access token where the audiences match, and one that chooses its own algorithm signs itself; an opaque token says nothing by itself, so only its issuer knows whether it was revoked and for whom it was issued.

#### Examples

```pseudo title="Avoid"
function actorFrom(token, signingKeys)
  let claims = verifySignature(token, signingKeys)   # any algorithm, issuer, audience or age

  return { accountId: claims.sub }
```

```pseudo title="Prefer"
let ACCESS_TOKEN_TYPE = "at+jwt"
let TRUSTED_ISSUER = "https://id.example.com"
let OWN_AUDIENCE = "https://api.example.com"

function actorFrom(token, signingKeys, now)
  let claims = verifySignedToken(token, {
    keys: signingKeys,
    algorithms: [ES256],
    type: ACCESS_TOKEN_TYPE,
    issuer: TRUSTED_ISSUER,
    audience: OWN_AUDIENCE,
    now: now
  })

  return { accountId: claims.sub }
```

### caller-token-never-forwarded · MUST

No token a caller presents is ever sent on to another system. A call onward carries the program's own credential for that system, or a token issued for that system by an exchange that keeps the caller's identity.

#### Why

A forwarded token turns the program into a confused deputy and erases its audit trail.

#### Examples

```pseudo title="Avoid"
# invoices/infrastructure/ledger/ledger.adapter
function createLedger({ httpClient })
  return {
    postEntry: function(entry, context)
      return httpClient.post("/entries", entry, {
        authorization: context.actor.token   # the caller's own token, sent on
      })
  }
```

```pseudo title="Prefer"
# invoices/infrastructure/ledger/ledger.adapter
function createLedger({ httpClient, tokenExchange })
  return {
    postEntry: function(entry, context)
      let token = tokenExchange.exchange(context.actor.token, { audience: LedgerAudience })

      return httpClient.post("/entries", entry, { authorization: token })
  }
```

### refresh-token-rotated-or-sender-bound · MUST

Every refresh token issued to an OAuth public client, one that can keep no secret, is rotated or bound to its sender. It is rotated on every use, a reused one revoking every token of its family, or bound to its holder by DPoP or mutual TLS.

#### Why

A refresh token lives long, so one stolen and neither rotated nor bound works for its thief as long as for its owner — RFC 9700.

#### Examples

```pseudo title="Avoid"
function refresh(presented, refreshTokenStore, now)
  let token = refreshTokenStore.findByHash(hash(presented))

  if token is <absent> or token.expiresAt < now then
    throw new InvalidRefreshTokenError()

  return {
    accessToken: issueAccessToken(token.accountId, now),
    refreshToken: presented   # the same token, for its whole life
  }
```

```pseudo title="Prefer"
function refresh(presented, refreshTokenStore, now)
  let token = refreshTokenStore.findByHash(hash(presented))

  if token is <absent> or token.expiresAt < now then
    throw new InvalidRefreshTokenError()

  if token.usedAt is not <absent> then
    refreshTokenStore.revokeFamily(token.familyId)
    throw new InvalidRefreshTokenError()

  refreshTokenStore.markUsed(token.id, now)

  return {
    accessToken: issueAccessToken(token.accountId, now),
    refreshToken: refreshTokenStore.issue(token.familyId, token.accountId, now)
  }
```

## Revocation

### token-issued-after-a-revocation-omits-the-right · MUST

Every token issued after a right is revoked leaves that right out.

#### Why

A token minted from a cache of rights that predates the revocation hands the revoked right back for that token's whole life.

#### Examples

```pseudo title="Avoid"
function refreshAccessToken(refreshToken, now)
  return signToken({
    sub: refreshToken.accountId,
    scope: refreshToken.scope,   # the rights held at sign-in
    expiresAt: now + accessTokenLifetime
  })
```

```pseudo title="Prefer"
function refreshAccessToken(refreshToken, rightStore, now)
  let rights = rightStore.rightsOf(refreshToken.accountId)

  return signToken({
    sub: refreshToken.accountId,
    scope: intersect(refreshToken.scope, rights),
    expiresAt: now + accessTokenLifetime
  })
```

### store-free-access-token-short-lived → credential-short-lived · MUST

Every access token checked without the store lives no longer than a bound the project sets.

#### Why

A right carried in a long-lived token outlasts its revocation by that token's life, which is the window an insider uses.

#### Examples

```pseudo title="Avoid"
# root/tokens
let issueAccessToken = createAccessTokenIssuer({
  signingKey: signingKey,
  lifetime: 30 days
})
```

```pseudo title="Prefer"
# root/tokens
let issueAccessToken = createAccessTokenIssuer({
  signingKey: signingKey,
  # Why: checked without the store, so a revoked right lives on in it this long
  lifetime: 10 minutes
})
```

## Machine credentials

### issued-key-stored-only-as-a-hash · MUST

Every issued key is kept by the program only as a hash.

#### Why

A key kept in clear is handed to whoever reads the store, one leak away from every call it allows.

#### Examples

```pseudo title="Avoid"
function issueKey(ownerId, issuedKeyStore, random)
  let key = random.issuedKey()

  issuedKeyStore.save({ ownerId: ownerId, key: key })   # every key in clear in the store

  return key
```

```pseudo title="Prefer"
function issueKey(ownerId, issuedKeyStore, random)
  let key = random.issuedKey()

  issuedKeyStore.save({ ownerId: ownerId, keyHash: sha256(key) })

  return key
```

### issued-key-expires → credential-short-lived · MUST

Every issued key expires within a bound the project sets.

#### Why

A key that lives for ever is a breach waiting for one leak, however long ago its holder stopped using it.

#### Examples

```pseudo title="Avoid"
function issueKey(ownerId, issuedKeyStore, random, now)
  let key = random.issuedKey()

  issuedKeyStore.save({
    ownerId: ownerId,
    keyHash: sha256(key),
    expiresAt: <absent>   # works for ever
  })

  return key
```

```pseudo title="Prefer"
function issueKey(ownerId, lifetime, issuedKeyStore, random, now)
  let key = random.issuedKey()

  issuedKeyStore.save({
    ownerId: ownerId,
    keyHash: sha256(key),
    expiresAt: now + min(lifetime, maxIssuedKeyLifetime)
  })

  return key
```

### issued-key-revocable-by-its-owner · MUST

Every issued key can be revoked by its owner.

#### Why

A leaked key its owner cannot revoke works for its thief until it expires.

#### Examples

```pseudo title="Avoid"
# accounts/application/use-cases/commands/revoke-key.use-case
function createRevokeKey({ issuedKeyStore, accessPolicy, clock })
  return function(input, context)
    accessPolicy.require(context.actor, ManageAllKeys)   # only an administrator revokes

    let key = issuedKeyStore.find(input.keyId, context)

    if key is <absent> then
      throw new IssuedKeyNotFoundError(input.keyId)

    issuedKeyStore.save(revoke(key, clock.now()), context)
```

```pseudo title="Prefer"
# accounts/application/use-cases/commands/revoke-key.use-case
function createRevokeKey({ issuedKeyStore, clock })
  return function(input, context)
    let key = issuedKeyStore.find(input.keyId, context)

    if key is <absent> or key.ownerId is not context.actor.accountId then
      throw new IssuedKeyNotFoundError(input.keyId)

    issuedKeyStore.save(revoke(key, clock.now()), context)
```

### issued-key-attributes-every-call · MUST

Every call made with an issued key is attributed to that key.

#### Why

Only attribution says what a leaked key did.

#### Examples

```pseudo title="Avoid"
function actorFromKey(presented, issuedKeyStore, now)
  let key = issuedKeyStore.findUsable(sha256(presented), now)

  if key is <absent> then
    throw new InvalidIssuedKeyError()

  return { accountId: key.ownerId }   # every key of the account looks alike
```

```pseudo title="Prefer"
function actorFromKey(presented, issuedKeyStore, now)
  let key = issuedKeyStore.findUsable(sha256(presented), now)

  if key is <absent> then
    throw new InvalidIssuedKeyError()

  return { accountId: key.ownerId, issuedKeyId: key.id }
```
