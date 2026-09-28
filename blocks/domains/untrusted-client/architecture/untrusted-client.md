# Untrusted client

## client-checks-repeated-on-server · MUST
Every check on the client — validation, permission, limit, price — is repeated where the client cannot reach it.
**Why:** a client check is for the user's convenience; a modified client skips it.
**Check:** review
**Tags:** security
**Implements:** `access-denied-unless-granted`
