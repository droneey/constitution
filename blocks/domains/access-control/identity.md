# Identity

> Governs who a caller is: sign-in, passwords, recovery, changes to an account, tokens and keys.

## Sign-in

### sign-in-through-a-provider-uses-code-with-pkce · MUST
A sign-in through an outside identity provider uses the authorization code flow with PKCE and a `redirect_uri` the provider matches exactly, checks the `iss` of the answer against the provider it asked where it trusts more than one (RFC 9207), and with OpenID Connect checks the `nonce` in the ID token; never the implicit flow or a password the user hands to the program for the provider.

| Why | Tags |
|---|---|
| without PKCE a code intercepted on its way back is redeemed by whoever caught it, a redirect matched by prefix sends the code elsewhere, an answer from another provider mixes up whose code it is, a token without its nonce is replayed, and the older flows hand a token or a password to places that keep it. | [security] |

### outside-identity-linked-by-issuer-and-subject · MUST
An account is found from an outside provider's identity by its issuer and subject; an email from the provider links that identity to an existing account only when the provider marks it verified and the account's owner has signed in to confirm the link.

| Why | Tags |
|---|---|
| an email the provider never verified is whatever its holder typed, so linking by it hands an existing account to anyone who claims its address. | [security] |

### sign-in-attempts-limited · MUST
Attempts at signing in, at a one-time code and at a recovery token are limited per account and per source, by a growing delay or a lock the account's owner can lift.

| Why | Tags |
|---|---|
| an unlimited attempt lets an attacker try passwords, or all of a short code's values, until one works. | [security] |

### phishing-resistant-factor-offered · SHOULD
A person can sign in with a phishing-resistant factor, such as a passkey.

| Why | Tags |
|---|---|
| a passkey cannot be typed into a fake page, which defeats the attack that steals most accounts. | [security] |

### privileged-account-signs-in-with-a-phishing-resistant-factor · MUST
An account with privileges over other accounts, the program's settings or its data signs in only with a phishing-resistant factor.

| Why | Tags |
|---|---|
| an administrator's account is the one an attacker phishes first, and one taken gives everything at once. | [security] |

### account-existence-never-revealed · MUST
Sign-in, sign-up and recovery answer the same way whether an account exists or not.

| Why | Tags |
|---|---|
| an answer that differs tells an attacker which addresses to attack. | [security] |

## Tokens

### token-verified-before-it-is-trusted · MUST
A token a caller presents is trusted only after its signature, by the algorithm the program expects, and its issuer, audience and expiry are checked; a token that names another algorithm or none is refused.

| Why | Tags |
|---|---|
| a token whose claims go unchecked is accepted from another issuer, for another service or after it expired, and one that chooses its own algorithm signs itself. | [security] |

### caller-token-never-forwarded · MUST
A token a caller presents is never sent on to another system; a call onward carries the program's own credential for that system, or a token issued for that system by an exchange that keeps the caller's identity.

| Why | Tags |
|---|---|
| a forwarded token turns the program into a confused deputy and erases its audit trail. | [security] |

### refresh-token-rotated-or-sender-bound · MUST
A refresh token the program issues is either rotated on every use, a reused one revoking every token of its family, or bound to its client by DPoP or mutual TLS, as RFC 9700 says.

| Why | Tags |
|---|---|
| a refresh token lives long, so one stolen and neither rotated nor bound works for its thief as long as for its owner. | [security] |

## Records

### security-event-recorded · MUST
A security event — a sign-in, a failed sign-in, a sign-out, a change of credentials, a grant or revocation of rights, a refused access — is recorded with who, what, when and from where.

| Why | Tags |
|---|---|
| an attack shows itself only in the events it leaves, and an event nobody recorded cannot be investigated. | [security] |

## Passwords

### password-judged-by-length-and-breach · MUST
A password is accepted by its length — at least the floor NIST SP 800-63B sets, and up to at least 64 characters, never cut short — and refused when it appears in a list of breached passwords; no rule of composition and no forced rotation is imposed.

| Why | Tags |
|---|---|
| length and breach lists stop the passwords attackers try, while composition rules and rotation push people to predictable ones. | [security] |

### password-stored-by-a-password-hash → security-primitive-from-a-vetted-library · MUST
A password is stored only as the output of a password-hashing function with its own salt — Argon2id, or scrypt where it is missing, or PBKDF2 at the iterations current guidance sets where only functions FIPS 140 validates may be used.

| Why | Tags |
|---|---|
| a stolen table of password hashes costs an attacker years where a fast hash costs hours, and PBKDF2 is the one such function FIPS 140 validates. | [security] |

## Recovery

### recovery-no-weaker-than-sign-in · MUST
Account recovery is no weaker than sign-in: its token is random, used once and expires, and it never skips a factor the account requires.

| Why | Tags |
|---|---|
| a recovery weaker than sign-in is the way in every attacker takes. | [security] |

## Changes to an account

### sensitive-change-asks-to-sign-in-again · MUST
A change to an account's email, password or factors asks the person to prove their identity again, and its owner is told of the change through the means they had before it.

| Why | Tags |
|---|---|
| a stolen session otherwise becomes a stolen account, and the owner learns of it only when they are locked out. | [security] |

## Machine credentials

### issued-key-stored-hashed-scoped-and-expiring · MUST
A key or token the program issues for another program to call it is shown once, stored only as a hash, scoped to what its holder needs, expires, and can be revoked by its owner, and every call made with it is attributed to it.

| Why | Tags |
|---|---|
| a key kept in clear, broad and for ever is a breach waiting for one leak, and only attribution says what a leaked key did. | [security] |
