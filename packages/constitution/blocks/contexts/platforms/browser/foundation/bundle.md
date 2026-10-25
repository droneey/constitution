# Bundle

> Governs the bundle's size and the caching of its files.

## General

### bundle-within-its-size-budget · SHOULD

Each bundle the tab loads stays within a size budget the project sets for it, one for each entry, never one for the whole output, and a build that exceeds the budget fails.

| Why |
|---|
| size grows one dependency at a time, and only a budget notices the change that crosses the line before people on slow networks and devices do; a budget for the whole output lets one entry grow at another's expense. |

### hashed-file-immutable-and-its-pointers-revalidated · SHOULD

A file whose name carries the hash of its content is served as `immutable`, and a file that points at others by name — the document, the runtime configuration, the service worker's script — is revalidated on every use.

| Why |
|---|
| a hashed file never changes, so it is kept for good, while the file that names it must be fresh, or the tab loads a release that no longer exists. |
