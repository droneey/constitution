# Routes

> Governs where Expo Router's routes are registered and where the router is imported.

## General

### expo-router-root-is-root-routes → delivery-unit-registered-by-the-root · MUST

Expo Router's root is set by its config plugin's `root: 'src/root/routes'`, so the routes are the root's registration and `app/` keeps its meaning as a feature's layer.

| Why |
|---|
| the router's default `src/app/` would give one word two meanings in one tree, and routes outside `root/` would put the root's registration in a folder of its own. |

### expo-router-only-in-the-root → ui-never-touches-navigation · MUST

The navigation library is the `expo-router` package with every subpath of it, such as `expo-router/stack`.

| Why |
|---|
| Expo Router spreads its primitives over several entry points, and a screen that imports any one of them reaches the router. |
