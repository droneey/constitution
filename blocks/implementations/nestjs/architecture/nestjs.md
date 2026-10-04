# NestJS

## providers-injected-through-the-constructor → one-explicit-composition-root
A provider takes its dependencies as `private readonly` parameters of its constructor, and a module's providers are its wiring; a provider never builds a dependency or reaches a global.

| Why | Check | Tags |
|---|---|---|
| a dependency the constructor names is one the injector replaces in a spec; one taken from elsewhere is fixed for good. | review | [testing] |

## error-kit-mapped-by-one-exception-filter → one-error-handler-per-transport
One exception filter, registered globally by the root, turns every failure into its answer: an expected error into the status its code maps to, and any other into a masked `500`.

| Why | Check | Tags |
|---|---|---|
| every failure of the transport leaves through one filter, in one shape, and no internal detail leaks past it. | review | [errors, security] |
