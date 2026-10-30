# Access control

> Governs how an answer shaped by its caller is cached.

## Caches

### personal-answer-kept-out-of-shared-caches → caller-shaped-result-never-served-from-a-cache-to-another · MUST

An answer shaped by its caller — their own data, their rights, their tenant — sets `Cache-Control: private` or `no-store`, and no shared cache in front of the server, a CDN's or a proxy's, is given a rule that stores it anyway.

| Why |
|---|
| with no directive a shared cache may keep one caller's answer and serve it to the next. |
