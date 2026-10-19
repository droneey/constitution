# Sign-in

> Governs how a person signs in, and how a password, a recovery and a change to an account are held to it.

## General

### sign-in-attempts-limited · MUST

Attempts at signing in, at a one-time code and at a recovery token are limited per account and per source, by a growing delay or a lock the account's owner can lift.

| Why | Tags |
|---|---|
| an unlimited attempt lets an attacker try passwords, or all of a short code's values, until one works. | [security] |

### account-existence-never-revealed · SHOULD

Sign-in and recovery answer the same way whether an account exists or not, and sign-up tells that an address is taken only in a message sent to that address.

| Why | Tags |
|---|---|
| an answer that differs tells an attacker which addresses to attack; OWASP ASVS asks for this only at its highest level, and a sign-in that asks for the identifier first gives some of it away, so a product may weigh it against the flow its users need. | [security] |

## Providers

### sign-in-through-a-provider-uses-code-with-pkce · MUST

A sign-in through an outside OAuth 2.0 or OpenID Connect provider uses the authorization code flow with PKCE and a `redirect_uri` the provider matches exactly, checks the `iss` of the answer against the provider it asked where it trusts more than one (RFC 9207), and with OpenID Connect checks the `nonce` in the ID token; never the implicit flow or a password the user hands to the program for the provider.

| Why | Tags |
|---|---|
| without PKCE a code intercepted on its way back is redeemed by whoever caught it, a redirect matched by prefix sends the code elsewhere, an answer from another provider mixes up whose code it is, a token without its nonce is replayed, and the older flows hand a token or a password to places that keep it. | [security] |

### outside-identity-linked-by-issuer-and-subject · MUST

An account is found from an outside provider's identity by its issuer and subject; an email from the provider links that identity to an existing account only when the provider marks it verified and the account's owner has signed in to confirm the link.

| Why | Tags |
|---|---|
| an email the provider never verified is whatever its holder typed, so linking by it hands an existing account to anyone who claims its address. | [security] |

## Factors

### sign-in-takes-more-than-a-password · MUST

An account signs in with a passkey, or with a password and a second factor.

| Why | Tags |
|---|---|
| a password alone falls to the reuse and the phishing that take most accounts, and NIST and OWASP ASVS ask for more than one factor wherever personal data is held. | [security] |

### phishing-resistant-factor-offered · MUST

A person can sign in with a phishing-resistant factor, such as a passkey.

| Why | Tags |
|---|---|
| a passkey cannot be typed into a fake page, which defeats the attack that steals most accounts, and NIST's guidance of 2025 makes offering one a duty. | [security] |

### privileged-account-signs-in-with-a-phishing-resistant-factor · MUST

An account with privileges over other accounts, the program's settings or other people's data signs in only with a phishing-resistant factor; where sign-in goes through an outside provider, the program reads that factor from the assertion the provider makes of it — in OpenID Connect, the ID token's `acr` or `amr` — and asks for one of its own where the provider asserts none.

| Why | Tags |
|---|---|
| an administrator's account is the one an attacker phishes first, and one taken gives everything at once. | [security] |

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
