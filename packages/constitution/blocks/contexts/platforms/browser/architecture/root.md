# Root

> Governs the composition root in a browser: when the tab reads its configuration.

## Assembly

### served-configuration-read-at-boot → root-alone-reads-the-environment · MUST

The tab reads its served configuration once, before the program starts.

| Why |
|---|
| configuration read piecemeal while the program runs fails in the middle of a session, long after the release that broke it, while one read before the start stops a missing or malformed setting at the start, in every environment alike — fail fast. |
