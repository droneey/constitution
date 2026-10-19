# Tokens

> Governs the tokens a caller presents and the keys a machine is issued.

## General

### token-verified-before-it-is-trusted · MUST

A token a caller presents is trusted only after it is checked. A self-contained token is checked by its signature, by the algorithm the program expects, and by its type, issuer, audience and expiry; one that names another algorithm or none is refused. An opaque token is checked with its issuer, which reports it active, and by the audience and expiry the issuer reports for it.

| Why | Tags |
|---|---|
| a token whose claims go unchecked is accepted from another issuer, for another service or after it expired, an ID token is passed off as an access token where the audiences match, and one that chooses its own algorithm signs itself; an opaque token says nothing by itself, so only its issuer knows whether it was revoked and for whom it was issued. | [security] |

### caller-token-never-forwarded · MUST

A token a caller presents is never sent on to another system; a call onward carries the program's own credential for that system, or a token issued for that system by an exchange that keeps the caller's identity.

| Why | Tags |
|---|---|
| a forwarded token turns the program into a confused deputy and erases its audit trail. | [security] |

### refresh-token-rotated-or-sender-bound · MUST

A refresh token the program issues to a public client is either rotated on every use, a reused one revoking every token of its family, or bound to its client by DPoP or mutual TLS, as RFC 9700 says.

| Why | Tags |
|---|---|
| a refresh token lives long, so one stolen and neither rotated nor bound works for its thief as long as for its owner. | [security] |

## Machine credentials

### issued-key-stored-hashed-scoped-and-expiring · MUST

A key or token the program issues for another program to call it is shown once, stored only as a hash, scoped to what its holder needs, expires, and can be revoked by its owner, and every call made with it is attributed to it.

| Why | Tags |
|---|---|
| a key kept in clear, broad and for ever is a breach waiting for one leak, and only attribution says what a leaked key did. | [security] |
