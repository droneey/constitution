# Remote service

> Governs specs of screens whose data travels through a transport to another system.

## General

### render-helper-replaces-the-transport → screen-spec-replaces-only-the-transport · MUST

The render helper replaces the transport with captured responses.

| Why |
|---|
| a helper that keeps the real transport sends every spec to the network, and one that fakes the client instead runs the specs against answers the vendor never gave. |
