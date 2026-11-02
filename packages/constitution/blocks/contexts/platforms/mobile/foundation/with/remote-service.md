# Remote service

> Governs the oldest version of the app the systems it calls support.

## Versions

### unsupported-app-version-asks-to-update → client-below-the-oldest-supported-release-updates-first · SHOULD

The app asks its user to update when it is older than the oldest version its server supports. It learns that version from its server, and below it asks before going on.

| Why |
|---|
| an installed app is updated only when its user chooses, so without a floor the server sets, a copy with a known flaw, or one that speaks a format the server dropped, runs on for good. |
