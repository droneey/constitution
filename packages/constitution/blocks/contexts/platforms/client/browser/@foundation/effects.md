# Effects

> Governs the browser's shared resources, the tab's storage, the page's exit, the browser's globals in code that also renders outside the tab, and the service worker.

## Resources and concurrency

### browser-resources-have-one-writer → shared-resource-has-one-writer · MUST

Each resource the tab shares with the browser has one writer. Such resources include the document's head, the URL, focus, the scroll position, the root element's classes and attributes, and the service worker.

#### Why

Each outlives the code that writes it, so two writers overwrite each other on every navigation and the last to run wins.

#### Examples

```tsx title="Avoid"
const applyStatus = (status: OrderStatus): void => {
  history.replaceState(null, "", `?status=${status}`); // writes the URL behind the router
  setStatus(status);
};
```

```tsx title="Prefer"
const [searchParams, setSearchParams] = useSearchParams();

const applyStatus = (status: OrderStatus): void => {
  setSearchParams({ status });
};
```

### tab-only-data-kept-in-persistent-storage · MUST

All data the program keeps only in the tab's storage is kept in storage the browser was asked to persist. Such data includes an offline draft and a queued write, and the program asks by `navigator.storage.persist()` when its user first saves such data.

#### Why

A browser short of space evicts the storage it was not asked to keep, and data held nowhere else is then lost without a trace.

#### Examples

```ts title="Avoid"
export const saveOrderDraft = async (draft: OrderDraft): Promise<void> => {
  await drafts.put(draft); // storage the browser may evict
};
```

```ts title="Prefer"
export const saveOrderDraft = async (draft: OrderDraft): Promise<void> => {
  if (!(await navigator.storage.persisted())) {
    await navigator.storage.persist();
  }
  await drafts.put(draft);
};
```

### page-exit-work-runs-when-the-page-hides · MUST

Every page's exit work runs when the page hides, never on unload. That work, such as saving its state or sending a last report, runs when `visibilitychange` reports `hidden` or on `pagehide`, never in an `unload` handler.

#### Why

Browsers no longer fire `unload` reliably, and a page that listens for it is kept out of the back/forward cache, so its last work is lost and the way back is slow.

#### Examples

```ts title="Avoid"
window.addEventListener("unload", () => {
  navigator.sendBeacon("/api/cart-drafts", JSON.stringify(cartDraft()));
});
```

```ts title="Prefer"
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    navigator.sendBeacon("/api/cart-drafts", JSON.stringify(cartDraft()));
  }
});
```

## Rendering outside the tab

### browser-global-never-read-while-rendering · MUST

No code that can render outside the tab reads a browser global while it renders. Outside the tab is on a server or in a prerender at build, and such code reads the globals only once it runs in the tab.

#### Why

Outside the tab the global does not exist, so the render fails there or produces markup that differs from the tab's.

#### Examples

```tsx title="Avoid"
// src/features/cart/presentation/components/cart-badge/cart-badge.tsx
export const CartBadge = ({ count }: CartBadgeProps): ReactElement => {
  const compact = window.innerWidth < 640; // no window on the server

  return <Badge count={count} compact={compact} />;
};
```

```tsx title="Prefer"
// src/features/cart/presentation/components/cart-badge/cart-badge.tsx
export const CartBadge = ({ count }: CartBadgeProps): ReactElement => (
  <Badge count={count} compact={useCompactViewport()} />
);
```

```ts title="Prefer"
// src/features/cart/presentation/components/cart-badge/cart-badge.hooks.ts
const COMPACT_QUERY = "(max-width: 639px)";

const subscribe = (onChange: () => void): (() => void) => {
  const query = window.matchMedia(COMPACT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

export const useCompactViewport = (): boolean =>
  useSyncExternalStore(subscribe, () => window.matchMedia(COMPACT_QUERY).matches, () => false);
```

## Service worker

### service-worker-update-waits-for-the-page · MUST

Every service worker that replaces another takes control of a page already open only by a release reload.

#### Why

A page whose worker changes under it fetches files of a release its code does not know, and a reload nobody asked for loses what its user was typing.

#### Examples

```ts title="Avoid"
// src/sw.ts
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting()); // takes over pages already open
});
```

```ts title="Prefer"
// src/sw.ts
self.addEventListener("message", (event) => {
  if (event.data === WorkerMessage.ReloadAccepted) {
    event.waitUntil(self.skipWaiting());
  }
});

// src/infrastructure/release-reload.ts
export const acceptReleaseReload = (registration: ServiceWorkerRegistration): void => {
  navigator.serviceWorker.addEventListener("controllerchange", () => location.reload());
  registration.waiting?.postMessage(WorkerMessage.ReloadAccepted);
};
```

### service-worker-deletes-its-older-caches → kept-collection-bounded · MUST

Every service worker that activates deletes the caches that its older versions filled.

#### Why

Caches left by old versions only grow, fill the origin's quota and push out the data the program still needs.

#### Examples

```ts title="Avoid"
// src/sw.ts
const cacheName = `shop-${release}`;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(releaseFiles)));
}); // every older shop-* cache stays
```

```ts title="Prefer"
// src/sw.ts
const cacheName = `shop-${release}`;

const deleteOlderCaches = async (): Promise<void> => {
  const names = await caches.keys();
  const older = names.filter((name) => name.startsWith("shop-") && name !== cacheName);
  await Promise.all(older.map((name) => caches.delete(name)));
};

self.addEventListener("activate", (event) => {
  event.waitUntil(deleteOlderCaches());
});
```
