# Native modules

> Governs the versions of native modules.

## General

### native-modules-at-sdk-versions · MUST

Every native module is at the version the project's Expo SDK supports, as `expo install --check` reports it.

| Why |
|---|
| a native module at another version builds and then crashes on a device. |
