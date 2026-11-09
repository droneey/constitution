# Route files

> Governs the file names of routes.

## General

### expo-router-file-names-kept → file-name-in-its-owners-case · MUST

Every route file keeps the name Expo Router finds it by, such as `_layout.tsx` for a layout and `(<name>)/` for a group.

#### Why

The router finds its layouts and groups by these names alone, so a file renamed to the project's case loses its role, and a layout becomes a page of its own.

#### Examples

```text title="Avoid"
src/app/
├── Layout.tsx
├── shop/
│   └── orders.tsx
└── index.tsx
```

```text title="Prefer"
src/app/
├── _layout.tsx
├── (shop)/
│   ├── _layout.tsx
│   └── orders.tsx
└── index.tsx
```
