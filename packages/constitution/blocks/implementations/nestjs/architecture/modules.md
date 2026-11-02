# Modules

> Governs the suffixes of Nest's files and their place in the tree, what a feature's module imports, registers and takes from the root, and global modules.

A module's file ends in **`.module.ts`**{#nest-module} and a controller's in **`.controller.ts`**{#nest-controller}; a token bound to its implementation by `useClass` or `useFactory` ends in **`.provider.ts`**{#nest-provider}, a pipe and an interceptor, the framework's providers of a request, in **`.pipe.ts`**{#nest-pipe} and **`.interceptor.ts`**{#nest-interceptor}, and a guard and an exception filter, which decide for the operations they guard or answer, in **`.guard.ts`**{#nest-guard} and **`.filter.ts`**{#nest-filter}. **`module/`**{#framework-module} holds a presentation's one module, and **`providers/`**{#framework-provider} the providers and the instances they provide.

## General

### modules-controllers-and-the-global-guard-in-the-presentation → delivery-unit-beside-what-it-serves · MUST

A Nest module lives in the presentation of what it serves, and a controller or the global guard is a binding unit. The root's module, `root/root.module.ts`, is one of the root's own files and imports the modules of features and of composition; a feature's module is `<feature>.module.ts` and a composition module's `<name>.module.ts`, each in its presentation's `module/`. A controller is `<name>.controller.ts`, and the root's module registers the global guard as `APP_GUARD`.

| Why |
|---|
| a module, a controller or a guard placed by habit is looked for in a different place in each program, one outside its feature's presentation hides which feature it belongs to, and a global guard kept among the root's files decides who passes where no case proves it. |

### feature-module-is-where-the-root-assembles-its-feature → composition-root-assembles-the-program · MUST

The module of a feature or of a composition module is the place where the root assembles it. The providers it lists are registrations the root declares through it, each binding a token to the implementation the root's module hands in, or to a use case built over it, by `useClass` or `useFactory`, and deciding nothing.

| Why |
|---|
| a use case imports no installed dependency, so the injector builds it only through a factory some module registers, and a module whose registrations decide or are found apart from the root's choice hides a concrete choice outside the one place the program is assembled. |

### providers-folder-holds-only-providers → package-laid-out-by-the-tree · MUST

A `providers/` folder holds only the framework's providers. A custom provider, a pipe and an interceptor sit in the `providers/` folder of the presentation, or of `root/`, whose module lists them, and that folder holds only `.provider.ts`, `.pipe.ts` and `.interceptor.ts` files and its surface; a guard and an exception filter are binding units of their presentation, never providers there, and a class the program writes — a use case, a port, an adapter — keeps the suffix and the folder of its role.

| Why |
|---|
| a provider kept away from the module that lists it is looked for in vain, a guard or a filter filed among the providers hides a decision every operation shares from the presentation that answers for it, and a class of the program's own layers filed among the framework's providers leaves the layer whose rules govern it. |

### feature-module-imports-only-its-own-shared-and-libs → feature-never-imports-a-feature · MUST

A feature's module imports only modules of its own feature, of `shared/` and of `libs/`.

| Why |
|---|
| a feature's module that imports another feature's ties the two features as an import of code would. |

### global-module-never-declared → container-holds-only-registrations-the-root-declares · MUST

No module the program writes is `@Global()`. A global module a library ships — a logger's, say — is imported only by the root's module.

| Why |
|---|
| a global module's providers reach every module unannounced, so a module's imports no longer show what it depends on; a library's, imported by the root alone, is a registration the root shows, as a logger is. |

### feature-module-takes-its-adapters-from-the-root → unit-receives-its-dependencies-by-contract · MUST

A feature's module takes its adapters from the root's module. What it takes from elsewhere — an adapter, one of its own feature's infrastructure included — the root's module passes in, the feature's module being a dynamic module whose static method takes the modules to import.

| Why |
|---|
| a feature's module that imports its adapters itself fixes them for good, so the root's module no longer names every concrete adapter and a spec cannot pass a fake in their place. |
