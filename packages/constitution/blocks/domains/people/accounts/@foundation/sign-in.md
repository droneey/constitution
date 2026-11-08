# Sign-in

> Governs how a person signs in, and how a password, a recovery and a change to an account are held to it.

## Vocabulary

A **sign-in password** is a password a person signs in to the program with.

A **phishing-resistant factor** is a factor bound to the origin it signs in to, so a fake page can neither take it nor pass it on, such as a passkey or a hardware security key; a code the person types and a push they approve are none.

## General

### sign-in-attempts-limited · MUST

Every attempt at signing in, at a one-time code or at a recovery token is limited per account. The limit is a growing delay or a lock the account's owner can lift.

#### Why

An unlimited attempt lets an attacker try passwords, or all of a short code's values, against one account until one works.

#### Examples

```text title="Avoid"
failed sign-ins for ana@shop.example
  1     refused
  2     refused
  ...
  9840  accepted
```

```text title="Prefer"
failed sign-ins for ana@shop.example
  1-5   refused
  6     refused, next try in 2 s
  7     refused, next try in 4 s
  8     refused, next try in 8 s
  ...
  20    locked until ana unlocks it
        from the link sent to her
```

### sign-in-attempts-limited-per-source · MUST

Every attempt at signing in, at a one-time code or at a recovery token is limited per source.

#### Why

A limit per account alone lets one source try a common password against every account in turn.

#### Examples

```text title="Avoid"
from 203.0.113.7, password "Summer2024!"
  ana@shop.example     refused
  ben@shop.example     refused
  ...
  4812 accounts tried, 3 accepted
```

```text title="Prefer"
from 203.0.113.7, password "Summer2024!"
  ana@shop.example     refused
  ben@shop.example     refused
  ...
  after 30 failures in 10 minutes
  every attempt from 203.0.113.7
  refused for 1 hour
```

### account-existence-never-revealed · MUST

No answer reveals whether an account exists: sign-in and recovery answer alike whether it exists or not, and sign-up tells that an address is taken only in a message sent to it. Exempt: a flow that asks for the identifier first, where the product records that it accepts this for its users' sake.

#### Why

An answer that differs tells an attacker which addresses to attack, and a flow that asks for the identifier first gives some of it away.

#### Examples

```text title="Avoid"
recover ana@shop.example
  -> We sent a reset link to
     ana@shop.example.

recover nobody@shop.example
  -> No account uses this email.
```

```text title="Prefer"
recover ana@shop.example
  -> If an account uses this email,
     a reset link is on its way.

recover nobody@shop.example
  -> If an account uses this email,
     a reset link is on its way.
```

## Providers

### sign-in-through-a-provider-uses-code-with-pkce · MUST

Every sign-in through an outside OAuth 2.0 or OpenID Connect provider uses the authorization code flow with PKCE. It never uses the implicit flow, nor a password the user hands to the program for the provider.

#### Why

Without PKCE a code intercepted on its way back is redeemed by whoever caught it, and the older flows hand a token or a password to places that keep it — RFC 9700.

#### Examples

```pseudo title="Avoid"
let state = randomSecret()
let nonce = randomSecret()

call pendingSignIns.save({ state, nonce }, context)

redirect(provider.authorizeUrl, {
  response_type: "id_token token",
  client_id: clientId,
  redirect_uri: callbackUrl,
  scope: "openid email",
  state: state,
  nonce: nonce
})
```

```pseudo title="Prefer"
let state = randomSecret()
let nonce = randomSecret()
let verifier = randomSecret()

call pendingSignIns.save({ state, nonce, verifier }, context)

redirect(provider.authorizeUrl, {
  response_type: "code",
  client_id: clientId,
  redirect_uri: callbackUrl,
  scope: "openid email",
  state: state,
  nonce: nonce,
  code_challenge: base64url(sha256(verifier)),
  code_challenge_method: "S256"
})
```

### provider-redirect-matched-exactly · MUST

Every sign-in through an outside provider uses a `redirect_uri` the provider matches exactly.

#### Why

A redirect matched by prefix sends the code to whatever address shares the prefix — RFC 9700.

#### Examples

```text title="Avoid"
registered  https://shop.example
asked       https://shop.example.evil.test/cb
matched     yes, by prefix
```

```text title="Prefer"
registered  https://shop.example/auth/callback
asked       https://shop.example.evil.test/cb
matched     no, refused
```

### provider-answer-checked-for-its-issuer · MUST

Where the program trusts several outside providers, every sign-in answer's `iss` is checked against the provider it asked.

#### Why

An answer from another provider mixes up whose code it is, so an attacker's provider redeems a code meant for an honest one — RFC 9207.

#### Examples

```pseudo title="Avoid"
function onProviderCallback(answer, context)
  let pending = pendingSignIns.take(answer.state, context)

  if pending is <absent>
    throw new UnknownSignInError(answer.state)

  let provider = providers.get(pending.providerId)

  return provider.redeem(answer.code, pending.verifier, context)
```

```pseudo title="Prefer"
function onProviderCallback(answer, context)
  let pending = pendingSignIns.take(answer.state, context)

  if pending is <absent>
    throw new UnknownSignInError(answer.state)

  let provider = providers.get(pending.providerId)

  if answer.iss is not provider.issuer
    throw new IssuerMismatchError(answer.iss)

  return provider.redeem(answer.code, pending.verifier, context)
```

### id-token-checked-for-its-nonce · MUST

Every ID token of an OpenID Connect sign-in is checked for the `nonce` its request sent.

#### Why

An ID token whose nonce goes unchecked is replayed into another sign-in.

#### Examples

```pseudo title="Avoid"
let tokens = provider.redeem(answer.code, pending.verifier, context)
let claims = verifyIdToken(tokens.idToken, provider.keys, {
  issuer: provider.issuer,
  audience: clientId
})

return claims
```

```pseudo title="Prefer"
let tokens = provider.redeem(answer.code, pending.verifier, context)
let claims = verifyIdToken(tokens.idToken, provider.keys, {
  issuer: provider.issuer,
  audience: clientId
})

if claims.nonce is not pending.nonce
  throw new NonceMismatchError()

return claims
```

### outside-identity-found-by-its-subject-at-its-issuer · MUST

Every account is found from an outside identity by that identity's issuer and its subject.

#### Why

An email or a name the provider gives changes and is reused, so an account found by it is handed to whoever holds that value next.

#### Examples

```pseudo title="Avoid"
function accountForIdentity(claims, context)
  return accounts.findByEmail(claims.email, context)
```

```pseudo title="Prefer"
function accountForIdentity(claims, context)
  return accounts.findByOutsideIdentity({
    issuer: claims.iss,
    subject: claims.sub
  }, context)
```

### provider-email-links-only-a-confirmed-account · MUST

No provider's email links its identity to an existing account until the provider verified it and the owner confirmed by signing in. The email is one an outside provider gives, and the owner is the account's.

#### Why

An email the provider never verified is whatever its holder typed, so linking by it hands an existing account to anyone who claims its address.

#### Examples

```pseudo title="Avoid"
function linkByEmail(claims, context)
  let account = accounts.findByEmail(claims.email, context)

  if account is <absent>
    return

  call accounts.link(account.id, identityOf(claims), context)
```

```pseudo title="Prefer"
function offerLinkByEmail(claims, context)
  let account = accounts.findByEmail(claims.email, context)

  if account is <absent> or claims.email_verified is not true
    return

  call pendingLinks.open(account.id, identityOf(claims), context)

function confirmLink(link, signedIn, context)
  if link.accountId is not signedIn.accountId
    throw new LinkRefusedError(link.id)

  call accounts.link(link.accountId, link.identity, context)
```

## Factors

### sign-in-takes-more-than-a-password · MUST

Every sign-in takes more than a password: a passkey, or a password and a second factor. A sign-in through an outside provider takes them by the factors the provider's assertion names, or by one the program asks itself where it names none.

#### Why

A password alone falls to the reuse and the phishing that take most accounts — the project's tightening of NIST SP 800-63B-4, which allows a password alone at AAL1 and asks a second factor from AAL2 up.

#### Examples

```text title="Avoid"
sign in
  1  email and password
  -> signed in
```

```text title="Prefer"
sign in
  1  passkey
  -> signed in

sign in without a passkey
  1  email and password
  2  code from the authenticator app
  -> signed in
```

### phishing-resistant-factor-offered-to-every-person · MUST

Every person can choose a phishing-resistant factor to sign in with.

#### Why

A code or a push approval is handed to a fake page as readily as a password, so a person offered no phishing-resistant factor stays open to phishing whatever else they add — NIST SP 800-63B-4.

#### Examples

```text title="Avoid"
Sign-in and security
  Password             Change
  Codes by text        On
  Authenticator app    Set up
```

```text title="Prefer"
Sign-in and security
  Password             Change
  Codes by text        On
  Authenticator app    Set up
  Passkey              Add
  Security key         Add
```

### privileged-account-signs-in-with-a-phishing-resistant-factor · MUST

Every privileged account signs in only with a phishing-resistant factor. An account is privileged when it holds privileges over other accounts, the program's settings or other people's data. Where sign-in goes through an outside provider, the program reads that factor from the assertion the provider makes of it, such as an ID token's `acr` or `amr`, and asks for one of its own where the provider asserts none.

#### Why

An administrator's account is the one an attacker phishes first, and one taken gives everything at once — CISA's guidance on phishing-resistant MFA; NIST SP 800-63B-4 asks such a factor only at AAL3.

#### Examples

```pseudo title="Avoid"
function admitProviderSignIn(account, claims, context)
  if not claims.amr.includes("mfa")
    return askSecondFactor(account.id, context)

  return sessions.open(account.id, context)
```

```pseudo title="Prefer"
let PHISHING_RESISTANT_ACRS = { "phr", "phrh" }

function admitProviderSignIn(account, claims, context)
  if account.isPrivileged
      and claims.acr is not in PHISHING_RESISTANT_ACRS
    return askPasskey(account.id, context)

  if not claims.amr.includes("mfa")
    return askSecondFactor(account.id, context)

  return sessions.open(account.id, context)
```

## Passwords

### password-accepted-by-its-length · MUST

Every sign-in password is accepted from eight characters up to at least 64, never truncated, and refused below eight. Eight is the length floor NIST SP 800-63B-4 sets for a password used with another factor.

#### Why

Length stops the passwords attackers try, and a truncated password is weaker than the one its person chose — NIST SP 800-63B-4.

#### Examples

```pseudo title="Avoid"
let MIN_PASSWORD_LENGTH = 8
let MAX_PASSWORD_LENGTH = 20

function acceptedPassword(password)
  if password.length < MIN_PASSWORD_LENGTH
    throw new PasswordTooShortError(MIN_PASSWORD_LENGTH)

  return password.take(MAX_PASSWORD_LENGTH)  # the rest is cut
```

```pseudo title="Prefer"
let MIN_PASSWORD_LENGTH = 8
let MAX_PASSWORD_LENGTH = 128

function checkPasswordLength(password)
  if password.length < MIN_PASSWORD_LENGTH
    throw new PasswordTooShortError(MIN_PASSWORD_LENGTH)

  if password.length > MAX_PASSWORD_LENGTH
    throw new PasswordTooLongError(MAX_PASSWORD_LENGTH)
```

### breached-password-refused · MUST

Every sign-in password a person chooses is refused when it appears in a list of breached passwords.

#### Why

A breached password is the first one attackers try, whatever its length — NIST SP 800-63B-4.

#### Examples

```pseudo title="Avoid"
function checkChosenPassword(password, context)
  call checkPasswordLength(password)
```

```pseudo title="Prefer"
function checkChosenPassword(password, context)
  call checkPasswordLength(password)

  if breachedPasswords.contains(password, context)
    throw new BreachedPasswordError()
```

### password-free-of-composition-rules · MUST

No sign-in password is held to a rule of composition, such as a digit or a symbol it has to contain.

#### Why

Composition rules push people to predictable passwords, such as a capital first and a digit last — NIST SP 800-63B-4.

#### Examples

```pseudo title="Avoid"
function checkChosenPassword(password, context)
  call checkPasswordLength(password)

  if breachedPasswords.contains(password, context)
    throw new BreachedPasswordError()

  if not password.hasDigit() or not password.hasSymbol()
    throw new PasswordTooSimpleError()
```

```pseudo title="Prefer"
function checkChosenPassword(password, context)
  call checkPasswordLength(password)

  if breachedPasswords.contains(password, context)
    throw new BreachedPasswordError()
```

### password-never-rotated-by-force · MUST

No sign-in password is changed by force on a schedule. Exempt: a password with evidence of its compromise.

#### Why

Forced rotation pushes people to a predictable next password, one character away from the last — NIST SP 800-63B-4.

#### Examples

```text title="Avoid"
password policy
  expires         every 90 days
  once expired    changed before
                  the next sign-in
```

```text title="Prefer"
password policy
  expires         never
  forced change   only on evidence
                  of its compromise
```

### password-stored-by-a-password-hash → password-stored-only-hashed · MUST

Every password the program verifies is hashed with a salt of its own by Argon2id, or by scrypt where Argon2id is missing. Exempt: where only functions FIPS 140 validates are allowed, PBKDF2 at the iterations current guidance sets.

#### Why

A stolen table of password hashes costs an attacker years where a fast hash costs hours, PBKDF2 is the one such function FIPS 140 validates, and bcrypt is left out because it cuts a password at 72 bytes, which a password of 64 characters can pass — the OWASP Password Storage Cheat Sheet, and FIPS 140.

#### Examples

```pseudo title="Avoid"
let stored = bcrypt.hash(password, { cost: 12 })  # cuts at 72 bytes
```

```pseudo title="Prefer"
let stored = argon2id.hash(password, {
  salt: randomSalt(),
  memoryKib: 19456,
  iterations: 2,
  parallelism: 1
})
```

## Recovery

### recovery-no-weaker-than-sign-in · MUST

Every account recovery is no weaker than sign-in, never skipping a factor the account requires.

#### Why

A recovery weaker than sign-in is the way in every attacker takes.

#### Examples

```text title="Avoid"
sign in   password + authenticator app

recover
  1  link sent to the email
  2  new password
  -> signed in
```

```text title="Prefer"
sign in   password + authenticator app

recover
  1  link sent to the email
  2  code from the authenticator app
  3  new password
  -> signed in
```

### recovery-token-used-once · MUST

Every recovery token is used once.

#### Why

A recovery token used again opens the account to whoever finds it later in a mailbox, a log or a browser's history.

#### Examples

```pseudo title="Avoid"
function redeemRecoveryToken(rawToken, context)
  let token = recoveryTokens.find(sha256(rawToken), context)

  if token is <absent> or token.expiresAt <= clock.now()
    throw new RecoveryTokenRefusedError()

  return token.accountId
```

```pseudo title="Prefer"
function redeemRecoveryToken(rawToken, context)
  # Why: take removes the token as it reads it, so no
  # second use, even a concurrent one, finds it.
  let token = recoveryTokens.take(sha256(rawToken), context)

  if token is <absent> or token.expiresAt <= clock.now()
    throw new RecoveryTokenRefusedError()

  return token.accountId
```

### recovery-token-expires · MUST

Every recovery token expires within a short bound the project sets.

#### Why

A recovery token that lives for ever is taken from a mailbox or a log long after it was sent, and opens the account then.

#### Examples

```pseudo title="Avoid"
function issueRecoveryToken(accountId, context)
  let rawToken = randomSecret()

  call recoveryTokens.save({
    hash: sha256(rawToken),
    accountId: accountId
  }, context)

  return rawToken
```

```pseudo title="Prefer"
let RECOVERY_TOKEN_LIFETIME = 30 minutes

function issueRecoveryToken(accountId, context)
  let rawToken = randomSecret()

  call recoveryTokens.save({
    hash: sha256(rawToken),
    accountId: accountId,
    expiresAt: clock.now() + RECOVERY_TOKEN_LIFETIME
  }, context)

  return rawToken
```

## Changes to an account

### sensitive-change-asks-to-sign-in-again · MUST

Every change to an account's email, password or factors asks its person to prove their identity again.

#### Why

A stolen session otherwise becomes a stolen account.

#### Examples

```pseudo title="Avoid"
function changeEmail(input, context)
  let account = accounts.find(context.caller.accountId, context)

  call accounts.save(withEmail(account, input.newEmail), context)
  call mailer.send(account.email, EmailChangedNotice, context)
```

```pseudo title="Prefer"
let REAUTHENTICATION_WINDOW = 5 minutes

function changeEmail(input, context)
  let provenAt = context.session.authenticatedAt

  if clock.now() - provenAt > REAUTHENTICATION_WINDOW
    throw new ReauthenticationRequiredError()

  let account = accounts.find(context.caller.accountId, context)

  call accounts.save(withEmail(account, input.newEmail), context)
  call mailer.send(account.email, EmailChangedNotice, context)
```

### sensitive-change-told-to-its-owner · MUST

Every change to an account's email, password or factors is told to its owner through the means they had before the change.

#### Why

The owner otherwise learns of a stolen account only when they are locked out, and a notice sent to the new address reaches only the thief.

#### Examples

```pseudo title="Avoid"
function changeEmail(input, context)
  call requireRecentSignIn(context.session)

  let account = accounts.find(context.caller.accountId, context)

  call accounts.save(withEmail(account, input.newEmail), context)
  call mailer.send(input.newEmail, EmailChangedNotice, context)
```

```pseudo title="Prefer"
function changeEmail(input, context)
  call requireRecentSignIn(context.session)

  let account = accounts.find(context.caller.accountId, context)

  call accounts.save(withEmail(account, input.newEmail), context)
  call mailer.send(account.email, EmailChangedNotice, context)
```
