# Headers

> Governs the caching and security headers of the files the program serves, and where they are set.

## General

### headers-set-where-the-files-are-served · MUST

Every caching and security header is set by what serves the files, in the repository. Such a place is a route's `headers` or a request middleware where Start's server serves them, and the static host's configuration file where a static host serves the shell and the assets.

| Why |
|---|
| a header set anywhere else, in a proxy or a dashboard, drifts from what the program ships, and Start's request middleware never reaches a shell a static host serves, so a header set there is never sent. |

## Caching

### hashed-asset-cached-for-a-year → hashed-file-cached-as-immutable · SHOULD

Every hashed asset is served `immutable` with a year's `max-age`.

| Why |
|---|
| a browser that asks again for an asset whose name already changes with its content spends a request on what it holds. |

### fixed-name-file-served-no-cache → fixed-name-file-revalidated-on-every-use · MUST

Every document and the runtime configuration are served `no-cache`.

| Why |
|---|
| a browser that keeps a stale document loads a release that no longer exists, and one that keeps a stale configuration runs with settings that no longer hold. |

## Security

### shell-inline-scripts-allowed-by-hash → document-served-with-a-strict-content-security-policy · MUST

Every document's `Content-Security-Policy` allows the shell's inline scripts by their hashes.

| Why |
|---|
| the shell is prerendered once for every request, so it carries no nonce, and a hash is the one allowance of an inline script that a fixed document can hold. |
