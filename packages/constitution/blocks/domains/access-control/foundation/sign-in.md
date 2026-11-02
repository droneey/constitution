# Sign-in

> Governs how a person signs in, and how a password, a recovery and a change to an account are held to it.

## General

### sign-in-attempts-limited · MUST

Sign-in attempts are limited. Attempts at signing in, at a one-time code and at a recovery token are limited per account and per source, by a growing delay or a lock the account's owner can lift.

| Why |
|---|
| an unlimited attempt lets an attacker try passwords, or all of a short code's values, until one works. |

### account-existence-never-revealed · SHOULD

No answer reveals whether an account exists. Sign-in and recovery answer the same way whether an account exists or not, and sign-up tells that an address is taken only in a message sent to that address. A flow that asks for the identifier first may reveal it, where the product records that it accepts this for its users' sake.

| Why |
|---|
| an answer that differs tells an attacker which addresses to attack, and a flow that asks for the identifier first gives some of it away. |

## Providers

### sign-in-through-a-provider-uses-code-with-pkce · MUST

A sign-in through an outside provider uses the authorization code flow with PKCE. This holds for an OAuth 2.0 or OpenID Connect provider: the flow uses a `redirect_uri` the provider matches exactly, checks the `iss` of the answer against the provider it asked where it trusts more than one (RFC 9207), and with OpenID Connect checks the `nonce` in the ID token. It never uses the implicit flow or a password the user hands to the program for the provider.

| Why |
|---|
| without PKCE a code intercepted on its way back is redeemed by whoever caught it, a redirect matched by prefix sends the code elsewhere, an answer from another provider mixes up whose code it is, a token without its nonce is replayed, and the older flows hand a token or a password to places that keep it — RFC 9700. |

### outside-identity-linked-by-issuer-and-subject · MUST

An account is found from an outside identity by its issuer and subject. An email from the provider links that identity to an existing account only when the provider marks it verified and the account's owner has signed in to confirm the link.

| Why |
|---|
| an email the provider never verified is whatever its holder typed, so linking by it hands an existing account to anyone who claims its address. |

## Factors

### sign-in-takes-more-than-a-password · MUST

Sign-in takes more than a password, and every person can choose a phishing-resistant factor. An account signs in with a passkey, or with a password and a second factor, and a passkey is one such factor.

| Why |
|---|
| a password alone falls to the reuse and the phishing that take most accounts, and only a phishing-resistant factor cannot be typed into a fake page — NIST SP 800-63B-4. |

### privileged-account-signs-in-with-a-phishing-resistant-factor · MUST

A privileged account signs in only with a phishing-resistant factor. An account is privileged when it holds privileges over other accounts, the program's settings or other people's data. Where sign-in goes through an outside provider, the program reads that factor from the assertion the provider makes of it — in OpenID Connect, the ID token's `acr` or `amr` — and asks for one of its own where the provider asserts none.

| Why |
|---|
| an administrator's account is the one an attacker phishes first, and one taken gives everything at once. |

## Passwords

### password-judged-by-length-and-breach · MUST

A password is judged by its length and against breached passwords. It is accepted from at least the floor NIST SP 800-63B-4 sets up to at least 64 characters, never cut short, and refused when it appears in a list of breached passwords; no rule of composition and no forced rotation is imposed.

| Why |
|---|
| length and breach lists stop the passwords attackers try, while composition rules and rotation push people to predictable ones — NIST SP 800-63B-4. |

### password-stored-by-a-password-hash → security-primitive-from-a-vetted-library · MUST

A password is stored only by a password-hashing function. Each password gets its own salt, and the function is Argon2id, or scrypt where it is missing, or PBKDF2 at the iterations current guidance sets where only functions FIPS 140 validates may be used.

| Why |
|---|
| a stolen table of password hashes costs an attacker years where a fast hash costs hours, and PBKDF2 is the one such function FIPS 140 validates — the OWASP Password Storage Cheat Sheet, and FIPS 140. |

## Recovery

### recovery-no-weaker-than-sign-in · MUST

Account recovery is no weaker than sign-in. Its token is random, used once and expires, and recovery never skips a factor the account requires.

| Why |
|---|
| a recovery weaker than sign-in is the way in every attacker takes. |

## Changes to an account

### sensitive-change-asks-to-sign-in-again · MUST

A change to an account's email, password or factors asks its person to prove their identity again, and its owner is told of it. The owner is told through the means they had before the change.

| Why |
|---|
| a stolen session otherwise becomes a stolen account, and the owner learns of it only when they are locked out. |
