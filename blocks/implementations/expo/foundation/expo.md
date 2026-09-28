# Expo

## native-projects-generated-by-prebuild · SHOULD
The native projects are generated from `app.config.ts` and config plugins, never committed or edited by hand.
**Why:** a hand-edited native project drifts from the configuration and is lost on the next generation.
**Check:** review
**Tags:** workflow
**Implements:** `generated-files-marked-never-edited`

## expo-public-env-holds-no-secret · MUST
Variables with the public prefix are built into the bundle, so none holds a secret.
**Why:** everything in the bundle is readable by anyone who installs the app.
**Check:** review
**Tags:** security
**Implements:** `no-secret-in-client-code`

## device-secrets-in-secure-store · MUST
Tokens and secrets on the device live in the system keychain through secure storage, never in plain asynchronous storage.
**Why:** plain storage is readable from backups and by anyone who holds the device.
**Check:** review
**Tags:** security
**Implements:** `credentials-in-secure-storage`

## native-modules-at-sdk-versions · SHOULD
Native modules are installed at the versions the SDK supports, and the check verifies them with `expo install --check`.
**Why:** a native module at another version builds and then crashes on a device.
**Check:** review
**Tags:** workflow
