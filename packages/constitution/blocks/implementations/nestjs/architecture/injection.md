# Injection

> Governs how the injector hands a provider its dependencies, and the form an adapter takes for it.

## General

### providers-injected-through-the-constructor → unit-receives-its-dependencies-by-contract · MUST

A provider takes its dependencies as `private readonly` parameters of its constructor, and a module's providers are its wiring; a provider never builds a dependency or reaches a global.

| Why |
|---|
| a dependency the constructor names is one the injector replaces in a spec; one taken from elsewhere is fixed for good. |

### injector-never-asked-for-a-dependency → unit-receives-its-dependencies-by-contract · MUST

No provider, controller or guard takes `ModuleRef` and calls its `get` or `resolve`, or takes `DiscoveryService` to find providers by scanning.

| Why |
|---|
| a dependency asked for at run time appears in no constructor and no module, so neither a reader nor a spec sees it until it fails. |

### contracts-injected-by-token → container-wires-only-declared-bindings · MUST

A dependency that stands for a contract is injected by a token — an abstract class, or a `Symbol` named by `@Inject` — and bound to its implementation with `useClass` or `useFactory` in a module's `providers: [...]`; a constructor never names a concrete adapter class.

| Why |
|---|
| a module's `providers: [...]` then name every concrete choice, and a spec replaces one by binding the same token to a fake. |

### adapter-is-an-injectable-class → adapter-built-by-factory-object-or-class · SHOULD

An adapter is an `@Injectable()` class.

| Why |
|---|
| every other part a NestJS program wires is an injectable class, so an adapter in the same form is declared, bound and replaced in a spec as any of them is. |
