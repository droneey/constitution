# Bundle

> Governs what a page loads: the bundle's size, the format of its images, the caching of its files and a tab that outlives its release.

## Vocabulary

A **release reload** is a full load of the current release at the tab's next navigation, or after its user accepts a reload, which keeps what they typed.

## Size

### bundle-within-its-size-budget · SHOULD

Each bundle the tab loads stays within the size budget the project sets for its entry. Each entry has a budget of its own, never one shared by the whole output.

| Why |
|---|
| size grows one dependency at a time, and only a budget notices the change that crosses the line before people on slow networks and devices do, while a budget for the whole output lets one entry grow at another's expense. |

### content-image-in-a-modern-format · SHOULD

Every raster image a page shows in its content is served as AVIF or WebP.

| Why |
|---|
| a JPEG or a PNG carries the same picture in more bytes, which people on slow networks wait for, while every current browser decodes AVIF and WebP. |

## Caching

### hashed-file-cached-as-immutable · SHOULD

Every file named by the hash of its content is cached for good, served as `immutable`.

| Why |
|---|
| a hashed file never changes, so a browser that asks for it again spends a request on what it already holds. |

### fixed-name-file-revalidated-on-every-use · MUST

Every fixed-name file that names other files of its release, holds its settings or holds its code is revalidated on every use. A fixed-name file is one served under a name that stays the same when its content changes, such as the document, the served settings and the service worker's script.

| Why |
|---|
| such a file names the hashed files of its release, holds its settings or holds its code, so a stale copy makes the tab load a release that no longer exists, settings that no longer hold or code the release replaced. |

## Releases

### tab-missing-a-lazy-file-loads-the-current-release · MUST

Every tab whose lazily loaded file is gone after a release loads the current release. It does so by a full load of the navigation that failed, or by a release reload where the file was loaded without a navigation.

| Why |
|---|
| a tab stays open for days across releases, and its next lazy import asks for a hashed file the new release no longer serves, so the screen it opens fails to load. |
