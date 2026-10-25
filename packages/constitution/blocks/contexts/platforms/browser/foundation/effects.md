# Effects

> Governs runtime configuration, the browser's resources, the service worker, storage and the page's exit.

## General

### service-worker-update-waits-for-the-page · SHOULD

A new service worker takes control of a page already open only at the page's next navigation, or after its user accepts a reload the page offers.

| Why |
|---|
| a page whose worker changes under it fetches files of a release its code does not know, and a reload nobody asked for loses what its user was typing. |

### tab-only-data-kept-in-persistent-storage · SHOULD

Data that exists nowhere but in the tab — an offline draft, a queued write — is kept only in storage the program has asked the browser to persist, by `navigator.storage.persist()` when its user first saves such data.

| Why |
|---|
| a browser short of space evicts the storage it was not asked to keep, and data held nowhere else is then lost without a trace. |

### page-exit-work-runs-when-the-page-hides · MUST

Work a page does as it is left — saving its state, sending a last report — runs when `visibilitychange` reports `hidden` or on `pagehide`, never in an `unload` handler.

| Why |
|---|
| browsers no longer fire `unload` reliably, and a page that listens for it is kept out of the back/forward cache, so its last work is lost and the way back is slow. |

## Calls and resources

### service-worker-caches-versioned → kept-collection-bounded · MUST

Each cache a service worker fills is named by its version, and a worker that activates deletes the caches of every older version.

| Why |
|---|
| caches left by old versions only grow, fill the origin's quota and push out the data the program still needs. |

## Operations

### browser-resources-have-one-writer → shared-resource-has-one-writer · MUST

In the browser, the resources the program shares with its host include the document's head, the URL, focus, the scroll position, the root element's classes and attributes, and the service worker; each has one writer.

| Why |
|---|
| each outlives the code that writes it, so two writers overwrite each other on every navigation and the last to run wins. |

## Records and configuration

### runtime-configuration-served-beside-bundle → one-artefact-serves-every-environment · MUST

One bundle serves every environment: a setting that differs between environments is served beside the bundle, never built into it.

| Why |
|---|
| one tested bundle is promoted from staging to production unchanged, and nothing that belongs to one environment ships inside it. |
