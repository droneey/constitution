# Expo

## native-projects-generated-by-prebuild · MUST
The native projects are generated from `app.config.ts` and config plugins, never committed or edited by hand.
**Why:** a hand-edited native project drifts from the configuration and is lost on the next generation.
**Check:** review
**Tags:** process
**Implements:** `generated-files-marked-never-edited`

## expo-public-env-holds-no-secret · MUST
Variables with the public prefix are built into the bundle, so none holds a secret.
**Why:** everything in the bundle is readable by anyone who installs the app.
**Check:** review
**Tags:** security
**Implements:** `secret-never-in-url-or-artefact`

## native-modules-at-sdk-versions · SHOULD
Native modules are installed at the versions the SDK supports, and the check verifies them with `expo install --check`.
**Why:** a native module at another version builds and then crashes on a device.
**Check:** review
**Tags:** process
