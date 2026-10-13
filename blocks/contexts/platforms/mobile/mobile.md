---
id: mobile
summary: Storage, links, traffic and releases of an app on a phone or tablet.
requires: [untrusted-client]
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**"]
---

# Mobile

> A program installed from a store on a phone or tablet. The system suspends and ends it, the network comes and goes, other apps on the device can send it data, and whoever holds the device can read what it keeps; what a screen adds is in `with/ui.md`.

## Types

### data-from-another-app-parsed-as-outside-input → outside-value-untyped-until-parsed · MUST
Data another app hands the app — an intent and its extras, a shared file or text, a payload from an extension — is outside input, parsed where it enters.

| Why | Tags |
|---|---|
| any app on the device can send an intent or share a file, and one crafted to look like the app's own reaches code that trusts it. | [security] |

## Effects

### background-work-handed-to-the-systems-scheduler → async-work-awaited-or-held-by-a-scope · MUST
Work that must finish after the app leaves the foreground — an upload, a sync, a queued write — is handed to the system's scheduler of background work, never left to a timer or a task of the app it suspends.

| Why | Tags |
|---|---|
| the system suspends and ends an app in the background without warning, and work no scheduler holds stops with it, half done. | [data, errors] |

## Security

### pinned-endpoint-carries-a-backup-pin · MUST
An endpoint whose identity the app pins is pinned to at least two keys, one of them a backup not yet in use.

| Why | Tags |
|---|---|
| a pinned key that must be replaced otherwise cuts every installed copy off its server until its user installs an update. | [security, errors] |

### sensitive-link-is-a-verified-app-link · MUST
A link that carries a credential or completes a sensitive flow — a password reset, a payment's return — is a verified link, Universal Links on iOS and App Links with `autoVerify` on Android, never a custom scheme; a sign-in's answer received inside the system's authentication session, with PKCE, may use the scheme its provider requires.

| Why | Tags |
|---|---|
| any app can claim a custom scheme, and the one that claims it first receives the code or the token meant for this app. | [security] |

### webview-confined-to-allowed-origins → outside-address-followed-only-from-an-allowlist · MUST
A WebView loads only the origins on the app's allowlist, and its bridge to native code answers only those origins.

| Why | Tags |
|---|---|
| a page loaded from elsewhere runs its script inside the app, and through the bridge it reaches whatever the app can. | [security] |

### app-component-exported-only-when-needed · MUST
A component another app can start or reach — an activity, a service, a receiver, a provider, a URL scheme — is exported only when another app must reach it.

| Why | Tags |
|---|---|
| every exported component is a door other apps on the device can open, and one exported by accident is a door nobody guards. | [security] |

### biometric-unlock-opens-a-protected-key · MUST
An unlock by biometrics or the device passcode that guards data or an action releases a key the system keeps behind that unlock — a keychain item with an access control, a keystore key that requires authentication — and never rests on the prompt's answer alone.

| Why | Tags |
|---|---|
| a prompt's yes is a value in the app's memory, which a tampered app returns without any finger, while a key the system releases only after the unlock cannot be faked that way. | [security] |

### push-payload-holds-no-secret → secret-and-personal-data-kept-out-of-output · MUST
A push notification's payload holds no secret and no personal data in clear: it carries an identifier, and the app fetches the content, or decrypts it, on the device.

| Why | Tags |
|---|---|
| a push passes through the platform's push service and may show on a locked screen, so what it carries in clear reaches people and systems the user never chose. | [security, data] |

### release-build-carries-no-debugging · MUST
A release build is not debuggable and carries no development menu, no connection to a development server and no trust of user-added certificates.

| Why | Tags |
|---|---|
| each of these lets whoever holds the phone read the app's memory, change its code or read its traffic. | [security] |

### personal-data-at-rest-kept-in-the-protected-class · MUST
Personal data the app stores beyond its credentials sits in the system's strongest protected file class it can use — `complete` on iOS, or `completeUnlessOpen` where work in the background must write it, and the app's private, encrypted storage on Android — is left out of backups to other devices where it identifies its person, and never reaches the system's shared logs.

| Why | Tags |
|---|---|
| a device that is lost, backed up to another account or read by another app gives up whatever the app left outside the protected class. | [security, data] |

### downloaded-code-verified-before-it-runs · MUST
Code the app receives after it is installed — an update of its script bundle over the air — runs only once its signature, made by the project's own key, is verified on the device.

| Why | Tags |
|---|---|
| an update channel that serves unsigned code lets whoever reaches it run their code in every installed copy. | [security] |

### genuine-app-proven-by-the-systems-attestation · MAY
A server that must know a request comes from the genuine app on a genuine device checks the system's attestation — App Attest on iOS, Play Integrity on Android.

| Why | Tags |
|---|---|
| a modified app or an emulator sends the same requests as the real app, and only a statement the system signs tells them apart. | [security] |

## Dependencies

### minimum-os-version-declared-and-reviewed · SHOULD
The oldest system version the app supports is declared with its reason, and reviewed each year against the versions its users run and those its vendor still ships security updates for.

| Why | Tags |
|---|---|
| an app on a system without patches runs on known holes that its own code cannot close. | [security] |

## Untrusted client

### credential-kept-in-the-keychain-or-keystore → client-credential-kept-in-the-protected-store · MUST
A token, a credential or a key the app holds lives only in the keychain or the keystore, in a class that never leaves the device in a backup, never in storage another app or a backup can read.

| Why | Tags |
|---|---|
| the keychain and the keystore are the stores the system encrypts and keeps from other apps, and an item that travels in a backup is restored on a device its user may not control. | [security] |

### purchase-granted-after-the-server-verifies-it → client-check-repeated-out-of-its-reach · MUST
A purchase or a subscription is granted only after the server verifies the store's signed transaction, never on the app's word that it was paid.

| Why | Tags |
|---|---|
| a modified app reports every purchase as paid, and only the store's signed record proves one was. | [security] |

## Versions

### unsupported-app-version-asks-to-update · SHOULD
The app learns the oldest version of itself its server still supports and, below it, asks its user to update before going on.

| Why | Tags |
|---|---|
| an installed app is updated only when its user chooses, so a fix for a flaw, or a change of the server's format, reaches every user only through a floor the server sets. | [security, data] |
