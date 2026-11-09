# Server

> Governs the query client of a program a server renders.

## General

### query-client-built-in-the-render-function → remote-data-cache-built-for-each-request · MUST

Every query client a server renders with is built inside the function that renders its request.

#### Why

A `QueryClient` held outside the render function, at a module's top level or in a closure built once, is the cache of every request that function renders.

#### Examples

```tsx title="Avoid"
// src/root/render-page.tsx
export const createRenderPage =
  (queryClient: QueryClient) =>
  (url: string): string =>
    renderToString(<App queryClient={queryClient} url={url} />);
```

```tsx title="Prefer"
// src/root/render-page.tsx
export const renderPage = (url: string): string => {
  const queryClient = createQueryClient();

  return renderToString(<App queryClient={queryClient} url={url} />);
};
```
