# Version control

> Governs the native projects in the history.

## General

### native-projects-never-committed → generated-files-not-committed · MUST

The native projects are never committed.

| Why |
|---|
| prebuild makes them again from the configuration, so a copy kept in the history drifts from it, and a reviewer reads a diff that no one wrote. |
