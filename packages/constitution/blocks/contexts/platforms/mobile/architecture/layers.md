# Layers

> Governs how the app reaches device capabilities.

## Direction

### device-capability-reached-through-a-port → effects-held-only-by-the-edge · MUST

Permissions, notifications, background work, secure storage and sensors are reached through adapters behind ports, never from a screen or the domain.

| Why |
|---|
| each capability then has one place that asks for its permission and handles a refusal, and a spec replaces it with a fake. |
