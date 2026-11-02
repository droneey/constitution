# Framework

> Governs where the framework that serves the program is imported.

## General

### server-framework-imported-by-the-presentation → layer-imports-dependencies-by-its-role · MUST

The server framework has its home in the presentation, where its delivery units sit. Outside the edge, that is the presentation of features, of composition modules and of the program, where its delivery units and binding units sit — the routers, handlers and tools that declare the operations, the handlers that answer its failures, and the modules and providers of a framework that has them.

| Why |
|---|
| a framework imported below its delivery units ties the domain and the use cases to it, so they change with each of its releases and cannot be tested without it. |
