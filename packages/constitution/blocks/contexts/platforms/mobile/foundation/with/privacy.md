# Privacy

> Governs permissions, store declarations, push payloads, personal data at rest and in backups, account deletion and tracking on a phone or tablet.

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
