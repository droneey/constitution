# Tokens

> Governs the tokens a caller presents or the program issues, and the keys a machine is issued.

## Vocabulary

An **issued key** is a key or a token the program issues for another program to call it.

## General

### token-verified-before-it-is-trusted · MUST

Every token a caller presents is trusted only after it is checked. A self-contained token is checked by its signature, by the algorithm the program expects, and by its type, issuer, audience and expiry, and one that names another algorithm or none is refused; an opaque token is checked with its issuer, which reports it active, and by the audience and expiry the issuer reports for it.

| Why |
|---|
| a token whose claims go unchecked is accepted from another issuer, for another service or after it expired, an ID token is passed off as an access token where the audiences match, and one that chooses its own algorithm signs itself; an opaque token says nothing by itself, so only its issuer knows whether it was revoked and for whom it was issued. |

### caller-token-never-forwarded · MUST

No token a caller presents is ever sent on to another system. A call onward carries the program's own credential for that system, or a token issued for that system by an exchange that keeps the caller's identity.

| Why |
|---|
| a forwarded token turns the program into a confused deputy and erases its audit trail. |

### refresh-token-rotated-or-sender-bound · MUST

Every refresh token issued to an OAuth public client, one that can keep no secret, is rotated or bound to its sender. It is rotated on every use, a reused one revoking every token of its family, or bound to its holder by DPoP or mutual TLS.

| Why |
|---|
| a refresh token lives long, so one stolen and neither rotated nor bound works for its thief as long as for its owner — RFC 9700. |

## Revocation

### token-issued-after-a-revocation-omits-the-right · MUST

Every token issued after a right is revoked leaves that right out.

| Why |
|---|
| a token minted from a cache of rights that predates the revocation hands the revoked right back for that token's whole life. |

### store-free-access-token-short-lived → credential-short-lived · MUST

Every access token checked without the store lives no longer than a bound the project sets.

| Why |
|---|
| a right carried in a long-lived token outlasts its revocation by that token's life, which is the window an insider uses. |

## Machine credentials

### issued-key-stored-only-as-a-hash · MUST

Every issued key is kept by the program only as a hash.

| Why |
|---|
| a key kept in clear is handed to whoever reads the store, one leak away from every call it allows. |

### issued-key-expires → credential-short-lived · MUST

Every issued key expires within a bound the project sets.

| Why |
|---|
| a key that lives for ever is a breach waiting for one leak, however long ago its holder stopped using it. |

### issued-key-revocable-by-its-owner · MUST

Every issued key can be revoked by its owner.

| Why |
|---|
| a leaked key its owner cannot revoke works for its thief until it expires. |

### issued-key-attributes-every-call · MUST

Every call made with an issued key is attributed to that key.

| Why |
|---|
| only attribution says what a leaked key did. |
