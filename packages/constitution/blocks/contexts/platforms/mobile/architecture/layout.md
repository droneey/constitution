# Layout

> Governs the tree of an app on a phone or tablet: the place of its extensions.

## Form

### app-extension-is-an-entrypoint → package-laid-out-by-the-tree · MUST

An app extension that starts the program's own root is an entry under `entrypoints/`. Such an extension — a widget, a share or notification extension, a watch app — composes features through their surfaces; one written in another language, or assembled apart, is a package of its own.

| Why |
|---|
| an extension is built and run apart from the app, so one that is no entry of its own drags the app's screens into an artefact that needs none of them. |
