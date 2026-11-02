# Effects

> Governs the browser's shared resources, the tab's storage, the page's exit, the service worker and runtime configuration.

## Resources and concurrency

### browser-resources-have-one-writer → shared-resource-has-one-writer · MUST

Each resource the tab shares with the browser has one writer. These resources include the document's head, the URL, focus, the scroll position, the root element's classes and attributes, and the service worker.

| Why |
|---|
| each outlives the code that writes it, so two writers overwrite each other on every navigation and the last to run wins. |

### tab-only-data-kept-in-persistent-storage · SHOULD

Data that exists only in the tab is kept in persistent storage. Such data — an offline draft, a queued write — sits only in storage the program has asked the browser to persist, by `navigator.storage.persist()` when its user first saves such data.

| Why |
|---|
| a browser short of space evicts the storage it was not asked to keep, and data held nowhere else is then lost without a trace. |

### page-exit-work-runs-when-the-page-hides · MUST

A page's exit work runs when the page hides, never on unload. That work — saving its state, sending a last report — runs when `visibilitychange` reports `hidden` or on `pagehide`, never in an `unload` handler.

| Why |
|---|
| browsers no longer fire `unload` reliably, and a page that listens for it is kept out of the back/forward cache, so its last work is lost and the way back is slow. |

## Service worker

### service-worker-update-waits-for-the-page · SHOULD

A new service worker takes control of a page already open only at the page's next navigation, or after its user accepts a reload the page offers.

| Why |
|---|
| a page whose worker changes under it fetches files of a release its code does not know, and a reload nobody asked for loses what its user was typing. |

### service-worker-caches-versioned → growing-collection-bounded · MUST

A service worker's caches are versioned, and the old versions are deleted. Each cache a service worker fills is named by its version, and a worker that activates deletes the caches of every older version.

| Why |
|---|
| caches left by old versions only grow, fill the origin's quota and push out the data the program still needs. |

## Configuration

### one-bundle-serves-every-environment → one-artefact-serves-every-environment · MUST

One bundle serves every environment, the settings that differ between them served beside it. Its host serves them beside the bundle and the tab fetches them before the program starts; none is built into the bundle.

| Why |
|---|
| a setting built into the bundle means one build per environment, so production runs a bundle that was never tested, and a tab has no environment of its host to read, so a setting that is not built in reaches it only from its host, beside the bundle. |
