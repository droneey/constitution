# Security

> Governs links, webviews, exported components, biometrics, push payloads, the connections the app opens, release builds, downloaded code, and what the client keeps and grants.

## Secrets

### push-payload-carries-only-an-identifier → secret-kept-out-of-output · MUST

A push notification's payload carries in clear only an identifier. The app fetches the content, or decrypts it, on the device, so no secret and none of its user's data crosses the push service in clear.

| Why |
|---|
| a push passes through the platform's push service and may show on a locked screen, so what it carries in clear reaches people and systems the user never chose. |

### credential-kept-in-the-keychain-or-keystore → client-credential-kept-in-the-protected-store · MUST

A credential, a token or a key the app holds lives in the keychain or the keystore. It lives there — on iOS in a keychain class that never leaves the device, on Android encrypted by a non-exportable Keystore key in the app's private storage, left out of backups —, and none sits in storage another app or a backup can read.

| Why |
|---|
| a credential outside the stores the system encrypts and keeps from other apps is read by whoever reads the device's storage, and one that travels in a backup is restored on a device its user may not control. |

### biometric-unlock-opens-a-protected-key · MUST

A biometric unlock releases a key the system guards, never only a yes. This holds for an unlock by biometrics or the device passcode that guards data or an action: the key is one the system keeps behind that unlock — a keychain item with an access control, a keystore key that requires authentication — and the prompt's answer alone opens nothing.

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

A sensitive link is a verified app link, never a custom scheme. A link is sensitive when it carries a credential or completes a sensitive flow — a password reset, a payment's return —, and a verified link is a Universal Link on iOS or an App Link with `autoVerify` on Android; a sign-in's answer received inside the system's authentication session, with PKCE, may use the scheme its provider requires.

| Why |
|---|
| any app can claim a custom scheme, and the one that claims it first receives the code or the token meant for this app. |

### app-component-exported-only-when-needed · MUST

A component is exported only when another app must reach it. Such a component is one another app can start or reach — an activity, a service, a receiver, a provider, a URL scheme.

| Why |
|---|
| every exported component is a door other apps on the device can open, and one exported by accident is a door nobody guards — least privilege. |

## Connections

### traffic-sent-only-over-tls → network-connection-authenticated-and-encrypted · MUST

Every connection the app opens runs over TLS and trusts only the system's certificate authorities. App Transport Security keeps its defaults and Android's network configuration refuses cleartext; the one exception is a host's own certificate authority, still verified and named with its host and its reason, and none allows cleartext.

| Why |
|---|
| a phone joins networks its user does not control, where plain traffic is read and changed by anyone on the path. |

## Integrity

### release-build-carries-no-debugging · MUST

A release build carries no debugging. It is not debuggable and carries no development menu, and no connection to a development server.

| Why |
|---|
| each of these lets whoever holds the phone read the app's memory, change its code or read its traffic. |

### downloaded-code-verified-before-it-runs · MUST

Code the app receives after it is installed runs only once its signature is verified on the device. Such code — an update of its script bundle over the air — is signed by the project's own key.

| Why |
|---|
| an update channel that serves unsigned code lets whoever reaches it run their code in every installed copy. |

### purchase-granted-after-the-server-verifies-it → client-check-repeated-out-of-its-reach · MUST

A purchase or a subscription is granted only after the server verifies it. The server verifies the store's signed transaction, and the app's word that it was paid grants nothing.

| Why |
|---|
| a modified app reports every purchase as paid, and only the store's signed record proves one was. |
