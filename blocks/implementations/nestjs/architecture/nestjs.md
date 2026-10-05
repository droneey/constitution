# NestJS

## providers-injected-through-the-constructor → one-explicit-composition-root
A provider takes its dependencies as `private readonly` parameters of its constructor, and a module's providers are its wiring; a provider never builds a dependency or reaches a global.

| Why | Check | Tags |
|---|---|---|
| a dependency the constructor names is one the injector replaces in a spec; one taken from elsewhere is fixed for good. | review | [testing] |

## injector-never-asked-for-a-dependency → one-explicit-composition-root
No provider, controller or guard takes `ModuleRef` and calls its `get` or `resolve`, or takes `DiscoveryService` to find providers by scanning.

| Why | Check | Tags |
|---|---|---|
| a dependency asked for at run time appears in no constructor and no module, so neither a reader nor a spec sees it until it fails. | review | [testing] |

## no-global-module → one-explicit-composition-root
No module is `@Global()`; a module imports each module whose providers it takes.

| Why | Check | Tags |
|---|---|---|
| a global module's providers reach every module unannounced, so a module's imports no longer show what it depends on. | review | [] |

## contracts-injected-by-token → one-explicit-composition-root
A dependency that stands for a contract is injected by a token — an abstract class, or a `Symbol` named by `@Inject` — and bound to its implementation with `useClass` or `useFactory` in a module's `providers`; a constructor never names a concrete adapter class.

| Why | Check | Tags |
|---|---|---|
| a module's `providers` then name every concrete choice, and a spec replaces one by binding the same token to a fake. | review | [testing] |

## error-kit-mapped-by-one-exception-filter → one-error-handler-per-transport
One exception filter, registered globally by the root, turns every failure into its answer: an expected error into the status its code maps to, and any other into a masked `500`.

| Why | Check | Tags |
|---|---|---|
| every failure of the transport leaves through one filter, in one shape, and no internal detail leaks past it. | review | [errors, security] |
