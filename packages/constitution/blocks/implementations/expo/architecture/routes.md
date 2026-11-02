# Routes

> Governs where Expo Router's routes are registered and where the router is imported.

## General

### expo-router-root-is-root-routes → delivery-unit-registered-by-the-root · MUST

Expo Router's routes are the root's registration. The router's root is set by its config plugin's `root: 'src/root/routes'`.

| Why |
|---|
| the router's default, `src/app/`, would put the root's registration in a folder of its own, outside `root/`, where no reader of the root finds it. |

### navigation-library-includes-every-expo-router-subpath → ui-never-touches-navigation · MUST

The navigation library includes every subpath of `expo-router`. A subpath such as `expo-router/stack` is the library as much as the package's main entry is.

| Why |
|---|
| Expo Router spreads its primitives over several entry points, so a limit held on the main entry alone lets a screen reach the router through a subpath. |
