# Privacy

> Governs how a page reads a person's opt-out signal.

## Rights

### global-privacy-control-read-in-the-page → opt-out-signal-honoured · MUST

A page that sets a tracker of its own, or hands data to one, reads the opt-out signal from `navigator.globalPrivacyControl` before it does.

| Why |
|---|
| a request's header reaches only the server, so a page that tracks in the tab learns of the signal only from the page's own reading of it. |
