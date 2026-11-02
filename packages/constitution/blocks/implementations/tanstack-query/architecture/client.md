# Client

> Governs who builds the query client.

## General

### query-client-built-by-the-root → composition-root-assembles-the-program · MUST

`new QueryClient` is written only in `root/`, in the program's entry files and in specs.

| Why |
|---|
| the library's own examples build the client at a module's top level, where on the server every request shares it, one user's data with the next, and every spec shares it with the others. |
