# Security

> Governs what an app on a phone or tablet hands to others and lets in: the secrets its push payloads and its clipboard carry, what its keyboard learns, its web views, the links it answers, the parts other apps reach, and its purchases.

## What leaves the app

### push-payload-carries-no-secret-in-clear → secret-kept-out-of-output · MUST

No push notification's payload carries a secret in clear. The app fetches the secret, or decrypts it, on the device.

| Why |
|---|
| a push passes through the platform's push service and may show on a locked screen, so a secret it carries in clear reaches people and systems its user never chose. |

### copied-secret-marked-sensitive · MUST

Every secret the app copies carries each mark the system offers to keep a copied value private. Such marks keep it on the device, off the clipboard the user's other devices share, and out of the system's display of what was copied; such secrets include a one-time code, a password and a key.

| Why |
|---|
| a synced clipboard carries an unmarked secret to the user's other devices, and the system shows what was copied to whoever looks at the screen. |

### sensitive-field-kept-from-keyboard-learning · MUST

Every sensitive field is kept from the keyboard's learning. A field is sensitive when it takes a secret or a value its user would not see offered to whoever types next, such as a card number or a diagnosis; while it hides what is typed it is declared to the system as a password field, and while it shows what is typed it turns off the keyboard's suggestions and learning.

| Why |
|---|
| a keyboard learns what is typed and offers it again to whoever types next, and a third-party keyboard may send it away. |

## Input from outside

### webview-loads-only-allowed-origins → outside-address-followed-only-from-an-allowlist · MUST

Every web view the app embeds loads a page or a frame only from an origin on the app's allowlist.

| Why |
|---|
| a page loaded from elsewhere runs its script inside the app, and its user takes what it shows and asks for as the app's own. |

### webview-bridge-answers-only-allowed-origins → outside-address-followed-only-from-an-allowlist · MUST

Every web view's bridge to native code answers only a page or a frame whose origin is on the app's allowlist.

| Why |
|---|
| a page that reaches the bridge reaches whatever the app can, and a frame of another origin inside an allowed page reaches it as easily as the page. |

### sensitive-link-is-a-verified-app-link · MUST

Every sensitive link the app answers is a verified app link, never a custom scheme. A link is sensitive when it carries a credential or completes a flow that grants access or confirms a payment, such as a password reset or a payment's return, and a verified app link is a web address the system opens in the app only once the address's domain names the app as its own. Exempt: a custom scheme an identity provider requires for the answer to a sign-in, where PKCE protects the sign-in and a browser session the system keeps apart from the app runs it.

| Why |
|---|
| any app can claim a custom scheme, and the one that claims it first receives the code or the token meant for this app. |

### app-part-open-to-other-apps-only-where-needed · MUST

Every part of the app is open to other apps only where one of them needs to reach it. A part is open to another app when that app can start it, send it data or read from it; such parts include a component the system starts for another app, a scheme or a link the app answers, a file type it opens and a share target.

| Why |
|---|
| every open part is a door other apps on the device can open, and one left open by accident is a door nobody guards — least privilege. |

## Purchases

### purchase-granted-after-the-server-verifies-it → device-program-check-repeated-out-of-its-reach · MUST

Wherever the app's server holds what a purchase unlocks, it grants the purchase only after verifying the app store's signed transaction.

| Why |
|---|
| a modified app reports every purchase as paid, a subscription's renewal among them, and only the app store's signed record, checked where the app cannot reach, proves one was. |
