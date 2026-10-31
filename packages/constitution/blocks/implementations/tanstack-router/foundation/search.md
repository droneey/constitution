# Search

> Governs the search parameters: validated, defaulted and declared by a loader.

## General

### search-params-validated-by-schema → address-parsed-as-untrusted-input · MUST

Every route with search parameters validates them by a schema in `validateSearch` that gives every parameter a default, so a malformed URL opens the screen with its defaults instead of an error.

| Why |
|---|
| the URL is input anyone can type: an unvalidated parameter reaches the screen as whatever was typed, and a shared or old link with a parameter gone wrong still opens the screen. |

### loader-declares-the-search-it-reads · SHOULD

A loader that reads search params declares them in `loaderDeps`.

| Why |
|---|
| the loader then reruns when they change, and its cache entry is keyed by them. |
