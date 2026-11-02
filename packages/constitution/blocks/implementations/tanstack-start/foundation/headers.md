# Headers

> Governs the caching and security headers set where the files are served.

## General

### caching-set-where-the-files-are-served → hashed-file-immutable-and-its-pointers-revalidated · SHOULD

What serves the files sets their caching headers. That is Nitro's `routeRules` where Start's server serves them, and the host's configuration file in the repository where a static host serves the SPA's shell and assets: `immutable` with a year's `max-age` on the hashed assets, and `no-cache` on the documents and the runtime configuration.

| Why |
|---|
| caching set anywhere else (a proxy, a dashboard) drifts from what the program ships, so a browser keeps a stale document or fetches an unchanged asset again. |

### content-security-policy-set-where-documents-are-served → document-served-with-a-strict-content-security-policy · MUST

What serves the documents sets the Content Security Policy on every one. It sits beside the caching rules — Nitro's `routeRules` where Start's server serves them, the host's configuration file in the repository where a static host does — and allows the shell's inline scripts by hash, and a test reads the policy that is sent.

| Why |
|---|
| a policy set in a proxy nobody here sees changes apart from the program and is proven by no test, and Start's request middleware never reaches a shell a static host serves, so a policy set there is never sent. |

### security-headers-set-where-documents-are-served · SHOULD

What serves the documents sets the other security headers on every one, as it sets the policy. It sets there, beside the Content Security Policy, each header the browser's and HTTP's rules ask of a document, and a test reads the headers that are sent.

| Why |
|---|
| headers set in several places drift apart, and one that no test reads goes missing unseen. |
