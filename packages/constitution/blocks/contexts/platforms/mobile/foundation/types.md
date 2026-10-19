# Types

> Governs data from another app.

## Values from outside

### data-from-another-app-parsed-as-outside-input → outside-value-untyped-until-parsed · MUST

Data another app hands the app — an intent and its extras, a shared file or text, a payload from an extension — is outside input, parsed where it enters.

| Why | Tags |
|---|---|
| any app on the device can send an intent or share a file, and one crafted to look like the app's own reaches code that trusts it. | [security] |
