# Browser with privacy

> Governs how a page reads a person's opt-out signal.

### global-privacy-control-read-from-the-page-and-the-request → opt-out-signal-honoured · MUST
The opt-out signal is read from `navigator.globalPrivacyControl` in the page and from the `Sec-GPC` header of a request.

| Why | Tags |
|---|---|
| the signal reaches the program by these two ways, and a page that reads only one misses it where the other carries it. | [data] |
