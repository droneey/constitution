# Client

> Governs who builds the query client.

## General

### query-client-built-by-the-root → composition-root-wires-everything · MUST

`new QueryClient` is written only in `root/`, in the program's entry files and in specs.

| Why | Tags |
|---|---|
| the library's own examples build the client at a module's top level, where it is shared by every request on the server and every spec. | [] |
