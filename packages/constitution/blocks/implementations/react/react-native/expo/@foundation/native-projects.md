# Native projects

> Governs where the native projects come from.

## Vocabulary

The **native projects** are `ios/` and `android/`, the folders prebuild writes.

## General

### native-projects-generated-by-prebuild → generated-file-never-edited · MUST

The native projects are generated files that prebuild makes from `app.config.ts` and its config plugins.

| Why |
|---|
| prebuild writes the native projects again from the configuration, so a change made in them by hand is lost on the next generation, while one made in `app.config.ts` or a config plugin is applied every time. |
