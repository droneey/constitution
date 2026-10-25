# Version control

> Governs the native projects in the history.

## General

### native-projects-generated-by-prebuild → generated-files-not-committed · MUST

The native projects are a build output, generated from `app.config.ts` and config plugins: never committed, never edited by hand.

| Why |
|---|
| a native project kept in the history drifts from the configuration, and a hand edit to it is lost on the next generation. |
