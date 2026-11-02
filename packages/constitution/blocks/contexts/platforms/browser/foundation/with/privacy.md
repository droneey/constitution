# Privacy

> Governs how a page reads a person's opt-out signal.

## Rights

### global-privacy-control-read-in-the-page → opt-out-signal-honoured · MUST

A page that tracks reads the opt-out signal first. It tracks when it sets a tracker of its own or hands data to one, and it reads the signal from `navigator.globalPrivacyControl` before it does either.

| Why |
|---|
| a request's header reaches only the server, so a page that tracks in the tab without reading the signal itself tracks a person who opted out. |
