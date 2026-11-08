# Integrations

> Governs how a tab left open across releases keeps up with the server it calls.

## Releases

### outdated-tab-updates-by-a-release-reload → device-program-below-the-oldest-supported-release-updates-first · MUST

Every tab below the oldest release its server supports loads the current release itself, by a release reload.

| Why |
|---|
| a reload that drops what its user typed costs them their work, while one at the next navigation, or one they accept, keeps it. |
