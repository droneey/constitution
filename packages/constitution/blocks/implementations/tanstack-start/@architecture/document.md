# Document

> Governs the root route that builds the document, and the router's entries.

## General

### root-route-builds-the-document → composition-root-assembles-the-program · MUST

The root route builds the document and mounts the root's providers. It renders `<Scripts/>` and mounts the providers of `root/`.

#### Why

A document or a provider mounted outside the root is a concrete choice the root does not show, and a screen may run outside the providers it needs.

#### Examples

```tsx title="Avoid"
// src/client.tsx
hydrateRoot(
  document,
  <Providers>
    <StartClient />
  </Providers>,
);
```

```tsx title="Prefer"
// src/root/routes/__root.tsx
const RootDocument = ({ children }: { children: ReactNode }): ReactElement => (
  <html lang="en">
    <head>
      <HeadContent />
    </head>
    <body>
      <Providers>{children}</Providers>
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRouteWithContext<RouterContext>()({ shellComponent: RootDocument });
```

### start-router-entries-point-into-the-root → routes-registered-in-the-root · MUST

The `tanstackStart()` plugin names `router.entry`, `router.routesDirectory` and `router.generatedRouteTree` under `root/`.

#### Why

The plugin otherwise looks for the router and its routes at the top of the source, where the tree has no such folder, and finds no route to build.

#### Examples

```ts title="Avoid"
// vite.config.ts
export default defineConfig({
  plugins: [tanstackStart(), react(), babel({ presets: [reactCompilerPreset()] })],
});
```

```ts title="Prefer"
// vite.config.ts
export default defineConfig({
  plugins: [
    tanstackStart({
      router: {
        entry: 'root/router.ts',
        routesDirectory: 'root/routes',
        generatedRouteTree: 'root/routeTree.gen.ts',
      },
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});
```
