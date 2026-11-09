# Presentation

> Governs where a screen declares what its document says about it and the scripts of other parties it loads.

## Screens

### document-metadata-owned-by-screen · SHOULD

Every piece of a document's metadata, such as its description and its links, is declared by the screen that owns it.

#### Why

Metadata declared in a central file is left stale when its screen changes, and that file must know every screen.

#### Examples

```ts title="Avoid"
// src/presentation/document-metadata.ts
export const documentMetadata = {
  '/orders': { title: 'Orders', description: 'Every order you placed.' },
  '/invoices': { title: 'Invoices', description: 'Invoices to download.' },
} as const; // knows every screen, changes with none of them
```

```tsx title="Prefer"
// src/presentation/screens/orders-screen/orders-screen.tsx
export const OrdersScreen = (): ReactElement => (
  <>
    <title>Orders</title>
    <meta name="description" content="Every order you placed." />
    <OrderList />
  </>
);
```

### third-party-script-declared-where-it-is-used · MUST

Every script of another party is declared by the code that uses it, never in a shared document every screen loads. That code is a screen, a component, or the adapter of a service behind a port.

#### Why

A script declared in a shared document runs on every screen, those that never use it included, so its party reads what each of them shows and learns of each visit, and it stays after the code that needed it is gone.

#### Examples

```html title="Avoid"
<!-- index.html -->
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script async src="https://widget.support-chat.example/loader.js"></script> <!-- on every screen -->
</head>
```

```tsx title="Prefer"
// src/presentation/screens/help-screen/help-screen.tsx
export const HelpScreen = (): ReactElement => (
  <>
    <script async src="https://widget.support-chat.example/loader.js" />
    <HelpArticles />
  </>
);
```
