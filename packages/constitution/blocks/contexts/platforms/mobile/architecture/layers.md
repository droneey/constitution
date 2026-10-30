# Layers

> Governs the layers of an app on a phone or tablet: how it reaches device capabilities.

## Direction

### device-capability-reached-through-a-port → effects-held-only-by-the-edge · MUST

Permissions, notifications, background work, secure storage and sensors are reached through ports of the application that adapters in the infrastructure implement; no screen, binding unit, use case or domain code calls the platform's API for them.

| Why |
|---|
| each capability then has one place that asks for its permission and handles a refusal, and a spec replaces it with a fake. |
