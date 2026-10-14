# Mobile

> Governs the app's place in the tree: its device capabilities and its extensions.

## Layers

### device-capability-reached-through-a-port → effects-held-only-by-the-edge · MUST
Permissions, notifications, background work, secure storage and sensors are reached through adapters behind ports, never from a screen or the domain.

| Why | Tags |
|---|---|
| each capability then has one place that asks for its permission and handles a refusal, and a spec replaces it with a fake. | [testing] |

## Layout

### app-extension-is-an-entrypoint → package-laid-out-by-the-tree · SHOULD
An app extension — a widget, a share or notification extension, a watch app — that starts the program's own root is an entry under `entrypoints/`, which composes features through their surfaces; one written in another language, or wiring itself apart, is a package of its own.

| Why | Tags |
|---|---|
| an extension is built and run apart from the app, so as an entry of its own it ships only what it imports and never drags the app's screens in. | [performance] |
