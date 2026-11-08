# Native projects

> Governs where the native projects come from.

## Vocabulary

The **native projects** are `ios/` and `android/`, the folders prebuild writes.

## General

### native-projects-generated-by-prebuild → generated-file-never-edited · MUST

The native projects are generated files that prebuild makes from `app.config.ts` and its config plugins.

#### Why

Prebuild writes the native projects again from the configuration, so a change made in them by hand is lost on the next generation, while one made in `app.config.ts` or a config plugin is applied every time.

#### Examples

```xml title="Avoid"
<!-- ios/Shop/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>Scan a product barcode to add it to your cart.</string>
```

```ts title="Prefer"
// app.config.ts
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Shop',
  slug: 'shop',
  plugins: [
    ['expo-camera', { cameraPermission: 'Scan a product barcode to add it to your cart.' }],
  ],
};

export default config;
```
