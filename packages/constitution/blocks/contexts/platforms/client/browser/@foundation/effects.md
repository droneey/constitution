# Effects

> Governs the browser's shared resources, the tab's storage, the page's exit, the browser's globals in code that also renders outside the tab, and the service worker.

## Resources and concurrency

### browser-resources-have-one-writer → shared-resource-has-one-writer · MUST

Each resource the tab shares with the browser has one writer. Such resources include the document's head, the URL, focus, the scroll position, the root element's classes and attributes, and the service worker.

| Why |
|---|
| each outlives the code that writes it, so two writers overwrite each other on every navigation and the last to run wins. |

### tab-only-data-kept-in-persistent-storage · MUST

All data the program keeps only in the tab's storage is kept in storage the browser was asked to persist. Such data includes an offline draft and a queued write, and the program asks by `navigator.storage.persist()` when its user first saves such data.

| Why |
|---|
| a browser short of space evicts the storage it was not asked to keep, and data held nowhere else is then lost without a trace. |

### page-exit-work-runs-when-the-page-hides · MUST

Every page's exit work runs when the page hides, never on unload. That work, such as saving its state or sending a last report, runs when `visibilitychange` reports `hidden` or on `pagehide`, never in an `unload` handler.

| Why |
|---|
| browsers no longer fire `unload` reliably, and a page that listens for it is kept out of the back/forward cache, so its last work is lost and the way back is slow. |

## Rendering outside the tab

### browser-global-never-read-while-rendering · MUST

No code that can render outside the tab reads a browser global while it renders. Outside the tab is on a server or in a prerender at build, and such code reads the globals only once it runs in the tab.

| Why |
|---|
| outside the tab the global does not exist, so the render fails there or produces markup that differs from the tab's. |

## Service worker

### service-worker-update-waits-for-the-page · MUST

Every service worker that replaces another takes control of a page already open only by a release reload.

| Why |
|---|
| a page whose worker changes under it fetches files of a release its code does not know, and a reload nobody asked for loses what its user was typing. |

### service-worker-deletes-its-older-caches → kept-collection-bounded · MUST

Every service worker that activates deletes the caches that its older versions filled.

| Why |
|---|
| caches left by old versions only grow, fill the origin's quota and push out the data the program still needs. |
