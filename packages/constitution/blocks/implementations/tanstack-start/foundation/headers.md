# Headers

> Governs the caching and security headers set where the files are served.

## General

### caching-set-where-the-files-are-served → hashed-file-immutable-and-its-pointers-revalidated · SHOULD

What serves the files sets the caching headers — Nitro's `routeRules` where Start's server serves them, the host's configuration file in the repository where a static host serves the SPA's shell and assets: `immutable` with a year's `max-age` on the hashed assets, and `no-cache` on the documents and the runtime configuration.

| Why |
|---|
| whatever serves the files then says how long each may be kept, in the same configuration as the program's other headers. |

### content-security-policy-set-where-documents-are-served → document-served-with-a-strict-content-security-policy · MUST

What serves the documents sets the Content Security Policy on every one, beside the caching rules — Nitro's `routeRules` where Start's server serves them, the host's configuration file in the repository where a static host does — and the policy allows the shell's inline scripts by hash; a test reads the policy that is sent.

| Why |
|---|
| the policy then lives in the repository with the program, not in a proxy nobody here sees, and a test proves it is sent; Start's request middleware never reaches a shell a static host serves. |

### security-headers-set-where-documents-are-served · SHOULD

What serves the documents sets the other security headers on every one, as it sets the policy — `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, `Permissions-Policy` and `Reporting-Endpoints` — beside the Content Security Policy, and a test reads the headers that are sent.

| Why |
|---|
| one place for every header keeps them from drifting apart, and the test covers them all. |
