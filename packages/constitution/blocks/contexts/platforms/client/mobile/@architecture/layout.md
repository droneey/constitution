# Layout

> Governs the tree of an app on a phone or tablet: the place of its extensions.

## Form

### app-extension-is-an-entrypoint → package-laid-out-by-the-tree · MUST

Every app extension that starts the app's composition root is an artefact of its own under `entrypoints/`. An app extension is a part of the app that the system runs apart from it, such as an extension shown on the home screen or the lock screen, a share or notification extension, or a watch app. Exempt: an extension written in another language or assembled apart from the app, which is a package of its own.

#### Why

An extension is built and run apart from the app, so one that is no artefact of its own drags the app's screens into an artefact that needs none of them.

#### Examples

```text title="Avoid"
src/
├── App.swift
├── root/
└── presentation/
    └── screens/
        ├── OrderListScreen.swift
        └── OrderStatusWidget.swift
```

```text title="Prefer"
src/
├── App.swift
├── root/
├── presentation/
│   └── screens/
│       └── OrderListScreen.swift
└── entrypoints/
    └── order-status-widget/
        ├── OrderStatusWidget.swift
        └── OrderStatusWidgetBundle.swift
```
