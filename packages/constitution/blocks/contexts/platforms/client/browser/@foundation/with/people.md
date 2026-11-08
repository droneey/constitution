# People

> Governs how a page reads a person's opt-out signal.

## Rights

### global-privacy-control-read-in-the-page → opt-out-signal-honoured · MUST

Wherever the opt-out signal binds the product, every page that tracks reads it in the page before it tracks. A page tracks when it sets a tracker of its own or hands data to one, and it reads the signal from `navigator.globalPrivacyControl`.

| Why |
|---|
| a request's header reaches only the server, so a page that tracks in the tab without reading the signal itself tracks a person who opted out. |
