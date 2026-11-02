# Bundle

> Governs the bundle's size, the caching of its files and a tab that outlives its release.

## General

### bundle-within-its-size-budget · SHOULD

Each bundle the tab loads stays within its size budget. The project sets a budget for each entry, never one for the whole output, and a build that exceeds the budget fails.

| Why |
|---|
| size grows one dependency at a time, and only a budget notices the change that crosses the line before people on slow networks and devices do; a budget for the whole output lets one entry grow at another's expense. |

### hashed-file-immutable-and-its-pointers-revalidated · SHOULD

A file named by the hash of its content is cached for good, and a file that names others is revalidated on every use. The first is served as `immutable`; the second is one that points at others by name — the document, the runtime configuration, the service worker's script.

| Why |
|---|
| a hashed file never changes, so it is kept for good, while the file that names it must be fresh, or the tab loads a release that no longer exists. |

### tab-missing-a-lazy-file-loads-the-current-release · SHOULD

A tab whose lazily loaded file is gone after a release loads the current release in full. It makes a **release reload**{#release-reload}: a full load of the current release at its next navigation, or after its user accepts a reload, which keeps what they typed.

| Why |
|---|
| a tab stays open for days across releases, and its next lazy import asks for a hashed file the new release no longer serves, so the screen it opens fails to load. |
