# Security

> Governs pins, links, webviews, exported components, biometrics, push payloads, release builds, downloaded code, and what the client keeps and grants.

## Secrets

### push-payload-holds-no-secret → secret-kept-out-of-output · MUST

A push notification's payload holds no secret: it carries an identifier, and the app fetches the content, or decrypts it, on the device.

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

### purchase-granted-after-the-server-verifies-it → client-check-repeated-out-of-its-reach · MUST

A purchase or a subscription is granted only after the server verifies the store's signed transaction, never on the app's word that it was paid.

| Why |
|---|
| a modified app reports every purchase as paid, and only the store's signed record proves one was. |
