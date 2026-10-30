# Modules

> Governs the suffixes of Nest's files and their place in the tree, what a feature's module imports and takes from the root, global modules, and where NestJS is imported.

A module's file ends in **`.module.ts`**{#nest-module} and a controller's in **`.controller.ts`**{#nest-controller}; a token bound to its implementation by `useClass` or `useFactory` ends in **`.provider.ts`**{#nest-provider}, and the framework's providers of a request in **`.filter.ts`**{#nest-filter}, **`.pipe.ts`**{#nest-pipe}, **`.guard.ts`**{#nest-guard} and **`.interceptor.ts`**{#nest-interceptor}.

## General

### modules-and-controllers-in-the-presentation → package-laid-out-by-the-tree · SHOULD

The root's module, `root/root.module.ts`, is the program's wiring file and imports the modules of features and of composition; a feature's module is `<feature>.module.ts` and a composition module's `<name>.module.ts`, each in its presentation. A controller is `<name>.controller.ts` in the presentation of the feature it serves alone, or of the composition module whose features it composes.

| Why |
|---|
| a module and a controller are found in the same place in every program, and the tree still says which feature each belongs to. |

### providers-folder-holds-only-providers → package-laid-out-by-the-tree · SHOULD

A custom provider and a provider of a request sit in the `providers/` folder beside the module that lists them, which holds only `.provider.ts`, `.filter.ts`, `.pipe.ts`, `.guard.ts` and `.interceptor.ts` files and its surface; a class the program writes — a use case, an adapter, a repository — keeps the suffix and the folder of its role.

| Why |
|---|
| a provider is found beside the module that lists it, and a class of the program's own layers stays where its layer puts it, not among the framework's providers. |

### feature-module-imports-only-its-own-shared-and-libs → feature-never-imports-a-feature · MUST

A feature's module imports only modules of its own feature, of `shared/` and of `libs/`. A module that joins features lives in `composition/`, and the root's module imports it.

| Why |
|---|
| a feature's module that imports another feature's ties the two features as an import of code would. |

### nestjs-imported-by-modules-and-providers → server-framework-imported-by-the-delivery-units · MUST

NestJS's home reaches past the edge into the presentation of features and of composition modules, which holds the modules and controllers, and into every `providers/` folder, whose providers build the use cases.

| Why |
|---|
| the injector's decorators are written on the classes these folders hold; the domain and the application, its use cases, stay free of the framework, and a provider's factory builds each use case over its ports. |

### global-module-never-declared → container-wires-only-declared-bindings · MUST

No module the program writes is `@Global()`, and a global module a library ships — a logger's, say — is imported only by the root's module.

| Why |
|---|
| a global module's providers reach every module unannounced, so a module's imports no longer show what it depends on; a library's, imported by the root alone, is wiring the root shows, as a logger is. |

### feature-module-takes-its-adapters-from-the-root → unit-receives-its-dependencies-by-contract · MUST

What a feature's module takes from elsewhere — an adapter, one of its own feature's infrastructure included — the root's module passes in, the feature's module being a dynamic module whose static method takes the modules to import.

| Why |
|---|
| the root's module then names every concrete adapter, and a spec passes a fake in its place. |
