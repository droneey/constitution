# Privacy

> Governs permissions, store declarations, push payloads, account deletion and tracking on a phone or tablet.

## Processing

### push-payload-holds-no-personal-data-in-clear → personal-data-kept-out-of-output · MUST

A push notification's payload holds no personal data in clear: it carries an identifier, and the app fetches the content, or decrypts it, on the device.

| Why |
|---|
| a push passes through the platform's push service and may show on a locked screen, so what it carries in clear reaches people and systems the user never chose. |

### permission-narrowed-to-its-purpose → personal-data-collected-only-for-its-purpose · MUST

The app asks for the narrowest permission that serves a feature — approximate location over precise, the photos the person picks over the whole library, while in use over always — and declares no permission it never requests.

| Why |
|---|
| each permission opens personal data, and the narrowest one opens only what the purpose needs. |

### store-privacy-declarations-follow-the-inventory → privacy-notice-follows-the-inventory · MUST

The app's privacy declarations to its stores — Apple's privacy manifest and privacy details, Google Play's data safety section — follow the inventory of personal data, its SDKs' collection included, and change with it.

| Why |
|---|
| the stores show these declarations to people before they install, and a declaration that misses what an SDK collects misleads them. |

## Rights

### account-deletion-started-in-the-app → personal-data-erased-on-request · MUST

An app in which a person can create an account lets them start that account's deletion inside the app, and from a web page its store listing links.

| Why |
|---|
| a person who has only the app must be able to leave without hunting for a support address, and both stores require it. |

## Consent

### cross-app-tracking-waits-for-the-systems-prompt → processing-waits-for-its-consent · MUST

On iOS, tracking a person across other companies' apps and websites, the advertising identifier included, starts only after they allow it in the App Tracking Transparency prompt.

| Why |
|---|
| the prompt is where a person refuses tracking for every app at once, and tracking before it acts against a choice they have not been asked yet. |
