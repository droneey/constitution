# Mobile with privacy

> Governs permissions, store declarations, account deletion and tracking on a phone or tablet.

## Privacy

### permission-narrowed-to-its-purpose → personal-data-collected-only-for-its-purpose · MUST

The app asks for the narrowest permission that serves a feature — approximate location over precise, the photos the person picks over the whole library, while in use over always — and declares no permission it never requests.

| Why | Tags |
|---|---|
| each permission opens personal data, and the narrowest one opens only what the purpose needs. | [data, security] |

### store-privacy-declarations-follow-the-inventory → privacy-notice-follows-the-inventory · MUST

The app's privacy declarations to its stores — Apple's privacy manifest and privacy details, Google Play's data safety section — follow the inventory of personal data, its SDKs' collection included, and change with it.

| Why | Tags |
|---|---|
| the stores show these declarations to people before they install, and a declaration that misses what an SDK collects misleads them. | [data] |

### account-deletion-started-in-the-app → personal-data-erased-on-request · MUST

An app in which a person can create an account lets them start that account's deletion inside the app, and from a web page its store listing links.

| Why | Tags |
|---|---|
| a person who has only the app must be able to leave without hunting for a support address, and both stores require it. | [data] |

## Consent

### cross-app-tracking-waits-for-the-systems-prompt → processing-waits-for-its-consent · MUST

On iOS, tracking a person across other companies' apps and websites, the advertising identifier included, starts only after they allow it in the App Tracking Transparency prompt.

| Why | Tags |
|---|---|
| the prompt is where a person refuses tracking for every app at once, and tracking before it acts against a choice they have not been asked yet. | [data] |
