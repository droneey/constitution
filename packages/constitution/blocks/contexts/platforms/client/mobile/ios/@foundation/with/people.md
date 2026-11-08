# People

> Governs the personal data of an iOS app: the protection class of its files and its tracking across other apps.

## Data at rest

### personal-data-file-takes-the-complete-protection-class → personal-data-at-rest-kept-in-the-protected-class · MUST

Every file of personal data an iOS app stores takes the `complete` protection class. Exempt: a file that work in the background creates while the device is locked, which takes `completeUnlessOpen`, and an existing one that such work opens, to read or to write, which takes `completeUntilFirstUserAuthentication`.

| Why |
|---|
| a file of a weaker class than its use needs is readable while the device is locked, by whoever holds the device or reads its storage. |

## Consent

### cross-app-tracking-waits-for-the-systems-prompt → processing-waits-for-its-consent · MUST

No iOS app tracks a person across other companies' apps and websites until they allow it in the App Tracking Transparency prompt. Such tracking includes reading the advertising identifier.

| Why |
|---|
| the prompt is where a person refuses tracking for every app at once, and tracking before it acts against a choice they have not been asked yet. |
