# Privacy

> Governs permissions, store declarations, personal data at rest and in backups, account deletion and tracking on a phone or tablet.

## Processing

### permission-narrowed-to-its-purpose → personal-data-collected-only-for-its-purpose · MUST

The app asks for the narrowest permission that serves a capability. It takes approximate location over precise, the photos the person picks over the whole library, while in use over always, and declares no permission it never requests.

| Why |
|---|
| each permission opens personal data, and one wider than its capability needs opens data the purpose never called for — data minimisation. |

### store-privacy-declarations-follow-the-inventory → privacy-notice-follows-the-inventory · MUST

The app's privacy declarations to its stores follow the inventory of personal data. They are Apple's privacy manifest and privacy details and Google Play's data safety section; they include its SDKs' collection and change with the inventory.

| Why |
|---|
| the stores show these declarations to people before they install, and a declaration that misses what an SDK collects misleads them. |

## Data at rest

### personal-data-at-rest-kept-in-the-protected-class · MUST

Personal data the app stores beyond its credentials sits in the strongest protected file class the app can use. That class is `complete` on iOS, `completeUnlessOpen` where work in the background must write the data and `completeUntilFirstUserAuthentication` where it must read it, and the app's private, encrypted storage on Android.

| Why |
|---|
| a device that is lost, backed up to another account or read by another app gives up whatever the app left outside the protected class. |

### restorable-personal-data-left-out-of-device-backups · MUST

Personal data the server holds and can restore is left out of backups to other devices. Data that lives only on the device is backed up within the protection its class gives.

| Why |
|---|
| a backup restored to another device carries the person's data to a device and an account they may not hold, while data that lives only on the device is lost without its backup. |

## Rights

### account-deletion-started-in-the-app → personal-data-erased-on-request · MUST

A person can start their account's deletion inside the app. This holds for an app in which a person can create an account, and the deletion can also be started from a web page its store listing links.

| Why |
|---|
| a person who has only the app cannot leave without hunting for a support address, and both stores refuse an app that offers no way. |

## Consent

### cross-app-tracking-waits-for-the-systems-prompt → processing-waits-for-its-consent · MUST

On iOS, cross-app tracking starts only after the person allows it in the App Tracking Transparency prompt. It is the tracking of a person across other companies' apps and websites, the advertising identifier included.

| Why |
|---|
| the prompt is where a person refuses tracking for every app at once, and tracking before it acts against a choice they have not been asked yet. |
