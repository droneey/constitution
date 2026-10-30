# Framework

> Governs where the framework that serves the program is imported.

## General

### server-framework-imported-by-the-delivery-units → layer-imports-dependencies-by-its-role · MUST

The framework that serves the program's operations has its home past the edge in the delivery units of the presentation of features and of composition modules — the routers, handlers and tools that declare them — and in `root/`, which assembles it.

| Why |
|---|
| a delivery unit lives with the feature it serves, and the framework stays out of the domain and the use cases below it. |
