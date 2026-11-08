# Deployment

> Governs how a tab reads the settings of its deployment environment.

## Settings

### served-configuration-read-at-boot → environment-setting-reaches-the-artefact-from-its-host · MUST

Every tab reads its host's settings once, before the program starts. It reads them from a source such as a file the host serves beside the bundle or the document its server renders.

| Why |
|---|
| a tab has no environment variables of its host to read, so a setting not taken from what its host serves, a file beside the bundle or the document its server renders, is built into the bundle and carries one deployment environment's values wherever the bundle goes, while settings read once before the program starts fail at its start, not in the middle of a session — the twelve-factor app. |
