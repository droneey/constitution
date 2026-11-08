# Modules

> Governs the suffixes of Nest's files and their place in the tree, what a feature's module imports, registers and takes from the root, and global modules.

## Vocabulary

A module's file ends in **`.module.ts`**{#nest-module}: a feature's module file is `<feature>.module.ts`, and a composition module's `<name>.module.ts`. A controller's file ends in **`.controller.ts`**{#nest-controller}; a file of tokens bound to their implementations by `useClass` or `useFactory` ends in **`.providers.ts`**{#nest-provider}, a pipe and an interceptor, the framework's providers of a request, in **`.pipe.ts`**{#nest-pipe} and **`.interceptor.ts`**{#nest-interceptor}, and a guard and an exception filter, which decide for the operations they guard or answer, in **`.guard.ts`**{#nest-guard} and **`.filter.ts`**{#nest-filter}.

**`module/`**{#framework-module} holds a presentation's one module, and **`providers/`**{#framework-provider} the framework's providers.

## General

### nest-module-sits-in-the-presentation-it-serves → delivery-unit-beside-what-it-serves · MUST

Every Nest module lives in the `module/` of the presentation it serves. Exempt: the root's module, `root/root.module.ts`, one of the root's own files.

| Why |
|---|
| a module placed by habit is looked for in a different place in each program, one outside its feature's presentation hides which feature it belongs to, and the check of imports lets Nest's packages into a presentation and its `providers/` alone. |

### nest-controller-carries-the-controller-suffix → file-carries-its-role-suffix · MUST

Every controller sits in a file that ends in `.controller.ts`.

| Why |
|---|
| a controller named otherwise hides its role, and the lint settings that let a controller's decorated constructor import its classes as values miss it. |

### global-guard-registered-as-app-guard → delivery-unit-registered-by-the-root · MUST

Every global guard is an interface-wide unit of the presentation, which the root's module registers as `APP_GUARD`.

| Why |
|---|
| a guard bound route by route leaves the route someone forgot open to every caller, and a global guard kept among the root's files decides who passes where no case proves it. |

### feature-module-is-where-the-root-assembles-its-feature → composition-root-assembles-the-program · MUST

Every module of a feature or of a composition module is the place where the root assembles it. The providers it lists are registrations the root declares through it, each binding a token to the implementation the root's module hands in, or to a use case built over it, by `useClass` or `useFactory`, and deciding nothing.

| Why |
|---|
| a use case imports no installed dependency, so the injector builds it only through a factory some module registers, and a module whose registrations decide or are found apart from the root's choice hides a concrete choice outside the one place the program is assembled. |

### providers-folder-holds-only-providers → package-laid-out-by-the-tree · MUST

Every `providers/` folder holds only the framework's providers. A custom provider, a pipe and an interceptor sit in the `providers/` folder of the presentation, or of `root/`, whose module lists them, and that folder holds only `.providers.ts`, `.pipe.ts` and `.interceptor.ts` files and its surface; a class the program writes, such as a use case, a port or an adapter, keeps the suffix and the folder of its role.

| Why |
|---|
| a provider kept away from the module that lists it is looked for in vain, and a class of the program's own layers filed among the framework's providers leaves the layer whose rules govern it. |

### guard-or-filter-never-filed-as-a-provider → package-laid-out-by-the-tree · MUST

Every guard and exception filter is a unit of its presentation, never a provider in `providers/`.

| Why |
|---|
| a guard or a filter filed among the providers hides a decision every operation shares from the presentation that answers for it. |

### feature-module-imports-no-other-features-module → feature-never-imports-a-feature · MUST

No feature's module imports another feature's module. It imports only modules of its own feature, of `shared/` and those an installed library ships.

| Why |
|---|
| a feature's module that imports another feature's ties the two features as an import of code would. |

### global-module-never-declared → container-holds-only-registrations-the-root-declares · MUST

No module is `@Global()`. Exempt: a global module a library ships, such as a logger's, which only the root's module imports.

| Why |
|---|
| a global module's providers reach every module unannounced, so a module's imports no longer show what it depends on; a library's, imported by the root alone, is a registration the root shows, as a logger is. |

### feature-module-takes-its-adapters-from-the-root → composition-root-assembles-the-program · MUST

Every feature's module takes each adapter, its own feature's included, from the root's module. It is a dynamic module whose static method takes the modules to import.

| Why |
|---|
| a feature's module that imports its adapters itself fixes them for good, so the root's module no longer names every concrete adapter and a spec cannot pass a fake in their place. |
