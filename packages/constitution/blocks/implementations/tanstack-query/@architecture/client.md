# Client

> Governs who builds the query client.

## General

### query-client-built-by-the-root → composition-root-assembles-the-program · MUST

`new QueryClient` is written only in `root/`, in the program's entry files and in specs.

#### Why

The library's own examples build the client at a module's top level, where on the server every request shares it, one user's data with the next, and every spec shares it with the others.

#### Examples

```tsx title="Avoid"
// src/presentation/providers.tsx
const queryClient = new QueryClient();

export const Providers = ({ children }: ProvidersProps): ReactElement => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
```

```tsx title="Prefer"
// src/presentation/providers.tsx
export const Providers = ({ queryClient, children }: ProvidersProps): ReactElement => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// src/root/app.tsx
const queryClient = createQueryClient();

export const App = (): ReactElement => <Providers queryClient={queryClient}><Router /></Providers>;
```
