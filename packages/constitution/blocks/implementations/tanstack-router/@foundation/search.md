# Search

> Governs a route's parameters: parsed, defaulted and declared by a loader.

## General

### route-parameters-parsed-by-schema → address-parsed-as-untrusted-input · MUST

Every route's search and path parameters are parsed by a schema. The search is parsed in the route's `validateSearch`, and the path in its `params.parse`.

| Why |
|---|
| the URL is input anyone can type, so an unparsed parameter reaches the screen as whatever was typed — parse, don't validate. |

### search-falls-back-to-defaults → unparsable-address-opens-a-fallback · MUST

Every route whose search fails its schema opens with all of its search defaults, never with the parameters that did parse.

| Why |
|---|
| a search filled from the parameters that parsed beside defaults for the rest is a state no link asked for, while one that fails as a whole opens the screen as a fresh visit would. |

### loader-declares-the-search-it-reads · MUST

Every loader that reads search params declares them in `loaderDeps`.

| Why |
|---|
| a loader that reads search params it does not declare keeps the data of the old ones when they change, and its cache entry serves one set's data for another. |
