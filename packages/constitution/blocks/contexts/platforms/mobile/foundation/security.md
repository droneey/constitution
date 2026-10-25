# Security

> Governs pins, links, webviews, exported components, biometrics, push payloads, release builds, personal data at rest and in backups, downloaded code, attestation, and what the client keeps and grants.

## Secrets

### push-payload-holds-no-secret → secret-and-personal-data-kept-out-of-output · MUST

A push notification's payload holds no secret and no personal data in clear: it carries an identifier, and the app fetches the content, or decrypts it, on the device.

| Why |
|---|
| a push passes through the platform's push service and may show on a locked screen, so what it carries in clear reaches people and systems the user never chose. |

### credential-kept-in-the-keychain-or-keystore → client-credential-kept-in-the-protected-store · MUST

A token, a credential or a key the app holds lives in the iOS keychain in a class that never leaves the device, or on Android encrypted by a non-exportable Keystore key in the app's private storage, left out of backups; never in storage another app or a backup can read.

| Why |
|---|
| the keychain and the keystore are the stores the system encrypts and keeps from other apps, and an item that travels in a backup is restored on a device its user may not control. |

### biometric-unlock-opens-a-protected-key · MUST

An unlock by biometrics or the device passcode that guards data or an action releases a key the system keeps behind that unlock — a keychain item with an access control, a keystore key that requires authentication — and never rests on the prompt's answer alone.

| Why |
|---|
| a prompt's yes is a value in the app's memory, which a tampered app returns without any finger, while a key the system releases only after the unlock cannot be faked that way. |

## Input from outside

### webview-confined-to-allowed-origins → outside-address-followed-only-from-an-allowlist · MUST

A WebView loads only the origins on the app's allowlist, and its bridge to native code answers only those origins.

| Why |
|---|
| a page loaded from elsewhere runs its script inside the app, and through the bridge it reaches whatever the app can. |

### sensitive-link-is-a-verified-app-link · MUST

A link that carries a credential or completes a sensitive flow — a password reset, a payment's return — is a verified link, Universal Links on iOS and App Links with `autoVerify` on Android, never a custom scheme; a sign-in's answer received inside the system's authentication session, with PKCE, may use the scheme its provider requires.

| Why |
|---|
| any app can claim a custom scheme, and the one that claims it first receives the code or the token meant for this app. |

### app-component-exported-only-when-needed · MUST

A component another app can start or reach — an activity, a service, a receiver, a provider, a URL scheme — is exported only when another app must reach it.

| Why |
|---|
| every exported component is a door other apps on the device can open, and one exported by accident is a door nobody guards. |

## Data at rest

### personal-data-at-rest-kept-in-the-protected-class · MUST

Personal data the app stores beyond its credentials sits in the system's strongest protected file class it can use — `complete` on iOS, `completeUnlessOpen` where work in the background must write it and `completeUntilFirstUserAuthentication` where it must read it, and the app's private, encrypted storage on Android.

| Why |
|---|
| a device that is lost, backed up to another account or read by another app gives up whatever the app left outside the protected class. |

### restorable-personal-data-left-out-of-device-backups · MUST

Personal data the server holds and can restore is left out of backups to other devices; data that lives only on the device is backed up within the protection its class gives.

| Why |
|---|
| a backup restored to another device carries the person's data to a device and an account they may not hold, while data that lives only on the device is lost without its backup. |

## Integrity

### pinned-endpoint-carries-a-backup-pin · MUST

An endpoint whose identity the app pins is pinned to at least two keys, one of them a backup not yet in use.

| Why |
|---|
| a pinned key that must be replaced otherwise cuts every installed copy off its server until its user installs an update. |

### release-build-carries-no-debugging · MUST

A release build is not debuggable and carries no development menu, and no connection to a development server.

| Why |
|---|
| each of these lets whoever holds the phone read the app's memory, change its code or read its traffic. |

### downloaded-code-verified-before-it-runs · MUST

Code the app receives after it is installed — an update of its script bundle over the air — runs only once its signature, made by the project's own key, is verified on the device.

| Why |
|---|
| an update channel that serves unsigned code lets whoever reaches it run their code in every installed copy. |

### genuine-app-proven-by-the-systems-attestation · MAY

The app obtains the system's attestation — App Attest on iOS, Play Integrity on Android — and sends it with each request a server must trust as coming from the genuine app on a genuine device.

| Why |
|---|
| a modified app or an emulator sends the same requests as the real app, and only a statement the system signs tells them apart. |

### purchase-granted-after-the-server-verifies-it → client-check-repeated-out-of-its-reach · MUST

A purchase or a subscription is granted only after the server verifies the store's signed transaction, never on the app's word that it was paid.

| Why |
|---|
| a modified app reports every purchase as paid, and only the store's signed record proves one was. |
