# Sign-in

> Governs how a person signs in, and how a password, a recovery and a change to an account are held to it.

## Vocabulary

A **sign-in password** is a password a person signs in to the program with.

A **phishing-resistant factor** is a factor bound to the origin it signs in to, so a fake page can neither take it nor pass it on, such as a passkey or a hardware security key; a code the person types and a push they approve are none.

## General

### sign-in-attempts-limited · MUST

Every attempt at signing in, at a one-time code or at a recovery token is limited per account. The limit is a growing delay or a lock the account's owner can lift.

| Why |
|---|
| an unlimited attempt lets an attacker try passwords, or all of a short code's values, against one account until one works. |

### sign-in-attempts-limited-per-source · MUST

Every attempt at signing in, at a one-time code or at a recovery token is limited per source.

| Why |
|---|
| a limit per account alone lets one source try a common password against every account in turn. |

### account-existence-never-revealed · MUST

No answer reveals whether an account exists: sign-in and recovery answer alike whether it exists or not, and sign-up tells that an address is taken only in a message sent to it. Exempt: a flow that asks for the identifier first, where the product records that it accepts this for its users' sake.

| Why |
|---|
| an answer that differs tells an attacker which addresses to attack, and a flow that asks for the identifier first gives some of it away. |

## Providers

### sign-in-through-a-provider-uses-code-with-pkce · MUST

Every sign-in through an outside OAuth 2.0 or OpenID Connect provider uses the authorization code flow with PKCE. It never uses the implicit flow, nor a password the user hands to the program for the provider.

| Why |
|---|
| without PKCE a code intercepted on its way back is redeemed by whoever caught it, and the older flows hand a token or a password to places that keep it — RFC 9700. |

### provider-redirect-matched-exactly · MUST

Every sign-in through an outside provider uses a `redirect_uri` the provider matches exactly.

| Why |
|---|
| a redirect matched by prefix sends the code to whatever address shares the prefix — RFC 9700. |

### provider-answer-checked-for-its-issuer · MUST

Where the program trusts several outside providers, every sign-in answer's `iss` is checked against the provider it asked.

| Why |
|---|
| an answer from another provider mixes up whose code it is, so an attacker's provider redeems a code meant for an honest one — RFC 9207. |

### id-token-checked-for-its-nonce · MUST

Every ID token of an OpenID Connect sign-in is checked for the `nonce` its request sent.

| Why |
|---|
| an ID token whose nonce goes unchecked is replayed into another sign-in. |

### outside-identity-found-by-its-subject-at-its-issuer · MUST

Every account is found from an outside identity by that identity's issuer and its subject.

| Why |
|---|
| an email or a name the provider gives changes and is reused, so an account found by it is handed to whoever holds that value next. |

### provider-email-links-only-a-confirmed-account · MUST

No provider's email links its identity to an existing account until the provider verified it and the owner confirmed by signing in. The email is one an outside provider gives, and the owner is the account's.

| Why |
|---|
| an email the provider never verified is whatever its holder typed, so linking by it hands an existing account to anyone who claims its address. |

## Factors

### sign-in-takes-more-than-a-password · MUST

Every sign-in takes more than a password: a passkey, or a password and a second factor. A sign-in through an outside provider takes them by the factors the provider's assertion names, or by one the program asks itself where it names none.

| Why |
|---|
| a password alone falls to the reuse and the phishing that take most accounts — the project's tightening of NIST SP 800-63B-4, which allows a password alone at AAL1 and asks a second factor from AAL2 up. |

### phishing-resistant-factor-offered-to-every-person · MUST

Every person can choose a phishing-resistant factor to sign in with.

| Why |
|---|
| a code or a push approval is handed to a fake page as readily as a password, so a person offered no phishing-resistant factor stays open to phishing whatever else they add — NIST SP 800-63B-4. |

### privileged-account-signs-in-with-a-phishing-resistant-factor · MUST

Every privileged account signs in only with a phishing-resistant factor. An account is privileged when it holds privileges over other accounts, the program's settings or other people's data. Where sign-in goes through an outside provider, the program reads that factor from the assertion the provider makes of it, such as an ID token's `acr` or `amr`, and asks for one of its own where the provider asserts none.

| Why |
|---|
| an administrator's account is the one an attacker phishes first, and one taken gives everything at once — CISA's guidance on phishing-resistant MFA; NIST SP 800-63B-4 asks such a factor only at AAL3. |

## Passwords

### password-accepted-by-its-length · MUST

Every sign-in password is accepted from eight characters up to at least 64, never truncated, and refused below eight. Eight is the length floor NIST SP 800-63B-4 sets for a password used with another factor.

| Why |
|---|
| length stops the passwords attackers try, and a truncated password is weaker than the one its person chose — NIST SP 800-63B-4. |

### breached-password-refused · MUST

Every sign-in password a person chooses is refused when it appears in a list of breached passwords.

| Why |
|---|
| a breached password is the first one attackers try, whatever its length — NIST SP 800-63B-4. |

### password-free-of-composition-rules · MUST

No sign-in password is held to a rule of composition, such as a digit or a symbol it has to contain.

| Why |
|---|
| composition rules push people to predictable passwords, such as a capital first and a digit last — NIST SP 800-63B-4. |

### password-never-rotated-by-force · MUST

No sign-in password is changed by force on a schedule. Exempt: a password with evidence of its compromise.

| Why |
|---|
| forced rotation pushes people to a predictable next password, one character away from the last — NIST SP 800-63B-4. |

### password-stored-by-a-password-hash → password-stored-only-hashed · MUST

Every password the program verifies is hashed with a salt of its own by Argon2id, or by scrypt where Argon2id is missing. Exempt: where only functions FIPS 140 validates are allowed, PBKDF2 at the iterations current guidance sets.

| Why |
|---|
| a stolen table of password hashes costs an attacker years where a fast hash costs hours, PBKDF2 is the one such function FIPS 140 validates, and bcrypt is left out because it cuts a password at 72 bytes, which a password of 64 characters can pass — the OWASP Password Storage Cheat Sheet, and FIPS 140. |

## Recovery

### recovery-no-weaker-than-sign-in · MUST

Every account recovery is no weaker than sign-in, never skipping a factor the account requires.

| Why |
|---|
| a recovery weaker than sign-in is the way in every attacker takes. |

### recovery-token-used-once · MUST

Every recovery token is used once.

| Why |
|---|
| a recovery token used again opens the account to whoever finds it later in a mailbox, a log or a browser's history. |

### recovery-token-expires · MUST

Every recovery token expires within a short bound the project sets.

| Why |
|---|
| a recovery token that lives for ever is taken from a mailbox or a log long after it was sent, and opens the account then. |

## Changes to an account

### sensitive-change-asks-to-sign-in-again · MUST

Every change to an account's email, password or factors asks its person to prove their identity again.

| Why |
|---|
| a stolen session otherwise becomes a stolen account. |

### sensitive-change-told-to-its-owner · MUST

Every change to an account's email, password or factors is told to its owner through the means they had before the change.

| Why |
|---|
| the owner otherwise learns of a stolen account only when they are locked out, and a notice sent to the new address reaches only the thief. |
