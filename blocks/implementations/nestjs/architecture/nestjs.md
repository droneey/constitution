# NestJS

> **Vocabulary:** suffixes `.module`, a module; `.controller`, a controller; `.provider`, a token bound to its implementation by `useClass` or `useFactory`; `.filter`, `.pipe`, `.guard` and `.interceptor`, the framework's providers of a request.

## Files

### nestjs-files-in-the-tree → anatomy-top-level-by-concern
The root's module, `root/root.module.ts`, is the program's wiring file, and `api/api.module.ts` mounts the controllers of `api/`; a feature's module is `<feature>.module.ts` in its `app/`, and a module that joins features is `composition/<name>/<name>.module.ts`. A controller is `<name>.controller.ts`, in `api/`, or in a feature's `app/` when it serves that feature alone. A custom provider and a provider of a request sit in the `providers/` folder beside the module that lists them; a class the program writes — a use-case, an adapter, a repository — keeps the suffix of its role.

| Why | Tags |
|---|---|
| a module, a controller and a provider are found in the same place in every program, and the tree still says which feature each belongs to. | [] |

### providers-folder-holds-provider-files → nestjs-files-in-the-tree
A `providers/` folder holds only `.provider`, `.filter`, `.pipe`, `.guard` and `.interceptor` files, and its surface.

| Why | Tags |
|---|---|
| a provider is found by its suffix, and a file of another role is not hidden among them. | [] |

## Wiring

### adapter-is-an-injectable-class → adapter-is-a-factory-module-object-or-class
An adapter is an `@Injectable()` class, a provider like any other: it takes its dependencies through its constructor (`providers-injected-through-the-constructor`) and is bound in a module (`contracts-injected-by-token`).

| Why | Tags |
|---|---|
| every other part a NestJS program wires is an injectable class, so an adapter in the same form is declared, bound and replaced in a spec as any of them is. | [testing] |

### providers-injected-through-the-constructor → one-explicit-composition-root
A provider takes its dependencies as `private readonly` parameters of its constructor, and a module's providers are its wiring; a provider never builds a dependency or reaches a global.

| Why | Tags |
|---|---|
| a dependency the constructor names is one the injector replaces in a spec; one taken from elsewhere is fixed for good. | [testing] |

### injector-never-asked-for-a-dependency → one-explicit-composition-root
No provider, controller or guard takes `ModuleRef` and calls its `get` or `resolve`, or takes `DiscoveryService` to find providers by scanning.

| Why | Tags |
|---|---|
| a dependency asked for at run time appears in no constructor and no module, so neither a reader nor a spec sees it until it fails. | [testing] |

### no-global-module → one-explicit-composition-root
No module the program writes is `@Global()`, and a global module a library ships — a logger's, say — is imported only by the root's module. A feature's module imports only modules of its own feature, of `shared/` and of `libs/`; what it takes from elsewhere — the adapter of a contract of `contracts/` — the root's module passes in, the feature's module being a dynamic module whose static method takes the modules to import. A module that joins features lives in `composition/`, and the root's module imports it.

| Why | Tags |
|---|---|
| a global module's providers reach every module unannounced, so a module's imports no longer show what it depends on; a library's, imported by the root alone, is wiring the root shows, as a logger is; and a feature's module that imports another feature's ties the two features as an import of code would. | [] |

### contracts-injected-by-token → one-explicit-composition-root
A dependency that stands for a contract is injected by a token — an abstract class, or a `Symbol` named by `@Inject` — and bound to its implementation with `useClass` or `useFactory` in a module's `providers`; a constructor never names a concrete adapter class.

| Why | Tags |
|---|---|
| a module's `providers` then name every concrete choice, and a spec replaces one by binding the same token to a fake. | [testing] |

### error-kit-mapped-by-one-exception-filter → one-error-handler-registered-by-the-root
The handler is one exception filter whose `@Catch()` names no class, registered globally by the root; no controller or method binds a filter of its own with `@UseFilters`.

| Why | Tags |
|---|---|
| a filter that names no class receives every exception, the `NotFoundException` of an unknown route and the `BadRequestException` of a malformed body included, while a filter bound to one controller answers its failures in a second shape. | [errors, security] |

## Packages

### nestjs-imported-by-modules-and-providers → packages-imported-by-folder-role
NestJS's home reaches past the edge into `app/` and `composition/`, which hold the modules, controllers and injectable use-cases, and into every `providers/` folder.

| Why | Tags |
|---|---|
| the injector's decorators are written on the classes these folders hold; the domain, which they never reach, stays free of the framework. | [] |
