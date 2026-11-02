# Search

> Governs the search parameters: parsed, defaulted and declared by a loader.

## General

### search-params-parsed-by-schema → address-parsed-as-untrusted-input · MUST

Every route's search parameters are parsed by a schema. The schema sits in the route's `validateSearch`.

| Why |
|---|
| the URL is input anyone can type, so an unparsed parameter reaches the screen as whatever was typed — parse, don't validate. |

### search-falls-back-to-defaults · SHOULD

A route's search schema gives every parameter a default. A malformed URL then opens the screen with its defaults instead of an error.

| Why |
|---|
| a parameter without a default turns a shared or old link with one value gone wrong into an error, where the screen could have opened with its defaults. |

### loader-declares-the-search-it-reads · SHOULD

A loader that reads search params declares them in `loaderDeps`.

| Why |
|---|
| a loader that reads search params it does not declare keeps the data of the old ones when they change, and its cache entry serves one set's data for another. |
