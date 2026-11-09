# Native modules

> Governs the versions of native modules.

## General

### native-modules-at-sdk-versions · MUST

Every native module is at the version the project's Expo SDK supports, as `expo install --check` reports it.

#### Why

A native module at another version builds and then crashes on a device.

#### Examples

```bash title="Avoid"
npm install expo-camera@latest
```

```bash title="Prefer"
npx expo install expo-camera
npx expo install --check
```
