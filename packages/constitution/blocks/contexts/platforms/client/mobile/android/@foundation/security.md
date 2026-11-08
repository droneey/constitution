# Security

> Governs how an Android app protects the credentials it stores.

## What it holds

### credential-protected-by-a-non-exportable-keystore-key → credential-stored-only-in-the-protected-store · MUST

Every credential, token or key an Android app stores is protected by a non-exportable Android Keystore key: a key is itself such a Keystore key or is encrypted by one, and a credential or a token is encrypted by one.

| Why |
|---|
| a credential the Keystore does not protect is read by whoever reads the device's storage, and a key that can be exported leaves the device with whoever exports it. |
