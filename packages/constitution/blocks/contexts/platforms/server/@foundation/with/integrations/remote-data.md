# Remote data

> Governs the remote-data cache of a server that renders for its users.

## Cache

### remote-data-cache-built-for-each-request · MUST

Every request a server renders builds its own remote-data cache, never one built once and shared across requests.

#### Why

A cache shared across requests holds one user's remote data when it renders the next user's page, so it serves them data they may not see.

#### Examples

```tsx title="Avoid"
// src/root/render-page.tsx
export const createRenderPage =
  (cache: RemoteDataCache) =>
  (url: string): string =>
    renderToString(<App cache={cache} url={url} />);
```

```tsx title="Prefer"
// src/root/render-page.tsx
export const renderPage = (url: string): string =>
  renderToString(<App cache={createRemoteDataCache()} url={url} />);
```
