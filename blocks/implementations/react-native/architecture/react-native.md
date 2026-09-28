# React Native

## react-native-entry-imports-only · MUST
React Native is imported only from its package entry, never from its internal paths.
**Why:** internal paths change between releases without notice, and break the app on an update.
**Check:** tool — lint
**Tags:** architecture
