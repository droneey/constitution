# Security

> Governs how an Android app protects the credentials it stores.

## What it holds

### credential-protected-by-a-non-exportable-keystore-key → credential-stored-only-in-the-protected-store · MUST

Every credential, token or key an Android app stores is protected by a non-exportable Android Keystore key: a key is itself such a Keystore key or is encrypted by one, and a credential or a token is encrypted by one.

#### Why

A credential the Keystore does not protect is read by whoever reads the device's storage, and a key that can be exported leaves the device with whoever exports it.

#### Examples

```kotlin title="Avoid"
fun storeSessionToken(preferences: SharedPreferences, token: String) {
    preferences.edit { putString("session_token", token) }   // plain text in the app's files
}
```

```kotlin title="Prefer"
private const val SESSION_KEY_ALIAS = "session-token-key"

fun storeSessionToken(preferences: SharedPreferences, token: String) {
    val cipher = Cipher.getInstance("AES/GCM/NoPadding")

    cipher.init(Cipher.ENCRYPT_MODE, sessionTokenKey())
    val sealed = cipher.iv + cipher.doFinal(token.encodeToByteArray())
    preferences.edit { putString("session_token", Base64.encodeToString(sealed, Base64.NO_WRAP)) }
}

private fun sessionTokenKey(): SecretKey {
    val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    (keyStore.getKey(SESSION_KEY_ALIAS, null) as? SecretKey)?.let { return it }

    val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
    generator.init(
        KeyGenParameterSpec.Builder(SESSION_KEY_ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .build()
    )
    return generator.generateKey()
}
```
