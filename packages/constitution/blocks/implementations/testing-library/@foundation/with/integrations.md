# Integrations

> Governs specs of screens whose data travels through a transport to another system.

## General

### render-helper-replaces-the-transport → screen-spec-replaces-only-the-transport · MUST

Only the render helper replaces the transport with captured responses, never a spec of its own accord. A spec that needs another answer hands it to the render helper.

| Why |
|---|
| a transport replaced by hand in each spec drifts from spec to spec, and the spec that forgets it sends its requests to the network. |
