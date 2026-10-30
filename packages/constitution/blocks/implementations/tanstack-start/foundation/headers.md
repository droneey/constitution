# Headers

> Governs where the caching and security headers are set.

## General

### headers-set-where-the-files-are-served · MUST

What serves the files sets every header they are sent with — the caching headers, the Content Security Policy and the other security headers — in one place: Nitro's `routeRules` where Start's server serves them, the host's configuration file, kept beside the program, where a static host serves the SPA's shell and assets. The policy allows the shell's inline scripts by hash, and a test reads the headers that are sent.

| Why |
|---|
| the headers then live with the program, not in a proxy nobody here sees, one place keeps them from drifting apart, and Start's request middleware never reaches a shell a static host serves. |
