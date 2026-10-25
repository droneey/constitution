# Search

> Governs the search parameters: validated, merged, defaulted and declared by a loader.

## General

### search-params-validated-by-schema → address-parsed-as-untrusted-input · MUST

Every route with search parameters validates them by a schema in `validateSearch`.

| Why |
|---|
| the URL is input anyone can type, and an unvalidated parameter reaches the screen as whatever was typed. |

### search-params-merged-on-write → address-write-keeps-the-other-parameters · MUST

A write to the search merges with the current parameters, never replaces them.

| Why |
|---|
| a screen that changes its page must keep the filter another piece set. |

### search-falls-back-to-defaults · SHOULD

A route's search schema gives every param a default, so a malformed URL opens the screen with its defaults instead of an error.

| Why |
|---|
| a shared or old link still opens the screen. |

### loader-declares-the-search-it-reads · SHOULD

A loader that reads search params declares them in `loaderDeps`.

| Why |
|---|
| the loader then reruns when they change, and its cache entry is keyed by them. |
