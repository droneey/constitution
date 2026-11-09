# Client

> Governs who builds the query client.

## General

### query-client-built-by-the-root → composition-root-assembles-the-program · MUST

`new QueryClient` is written only in `root/`, in the program's entry files and in specs.

#### Why

A client built outside the root is configured where the composition root cannot see it, and one built at a module's top level, as the library's own examples build it, is shared by every spec that imports that module.

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
