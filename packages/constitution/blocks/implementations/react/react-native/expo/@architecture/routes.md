# Routes

> Governs where Expo Router's routes are registered and where the router is imported.

## Vocabulary

**`app/`**{#expo-routes}, at the top of the source, is a role folder of the composition root: the routes and layouts Expo Router reads, the root's registration in the place its calling framework fixes.

## General

### expo-routes-folder-belongs-to-the-root → package-laid-out-by-the-tree · MUST

Every route and layout sits in `src/app`, the root's routes folder Expo Router reads by default. It is never an `app` beside `src` or a folder the config plugin's `root` option sets.

#### Why

Expo calls a moved routes folder highly discouraged and takes no bug report on one (docs.expo.dev, src directory), and a routes folder no layer claims is one the import rules refuse the router in, though every route file imports it.

#### Examples

```text title="Avoid"
app/
├── _layout.tsx
└── orders.tsx
src/
├── features/orders/
└── root/
```

```text title="Prefer"
src/
├── app/
│   ├── _layout.tsx
│   └── orders.tsx
├── features/orders/
└── root/
```

### navigation-library-includes-every-expo-router-subpath → ui-never-touches-navigation · MUST

Only the root imports `expo-router`, by its main entry or any of its subpaths, such as `expo-router/stack`.

#### Why

Expo Router spreads its primitives over several entry points, so a limit held on the main entry alone lets a screen reach the router through a subpath.

#### Examples

```tsx title="Avoid"
// src/presentation/screens/orders/orders.tsx
import { Stack } from 'expo-router/stack';

export const OrdersScreen = ({ orders }: OrdersScreenProps): ReactElement => (
  <>
    <Stack.Screen options={{ title: t`Orders` }} />
    <OrderList orders={orders} />
  </>
);
```

```tsx title="Prefer"
// src/app/orders.tsx
import { Stack, useRouter } from 'expo-router';
import { OrdersScreen } from '../presentation/screens/orders';

export default function OrdersRoute(): ReactElement {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: t`Orders` }} />
      <OrdersScreen onOpenOrder={(orderId) => router.push(`/orders/${orderId}`)} />
    </>
  );
}
```
