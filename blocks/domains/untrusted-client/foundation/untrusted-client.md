# Untrusted client

## client-holds-nothing-hidden · MUST
Nothing shipped to the client — code, configuration, data in memory or in storage — is treated as hidden from its user, so none of it holds a secret; configuration the client receives at runtime is public.
**Why:** the user controls the device, and every byte on it can be read and changed.
**Check:** review
**Tags:** security
