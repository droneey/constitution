# NestJS

## providers-injected-through-the-constructor → one-explicit-composition-root
A provider takes its dependencies as `private readonly` parameters of its constructor, and a module's providers are its wiring; a provider never builds a dependency or reaches a global.

| Why | Check | Tags |
|---|---|---|
| a dependency the constructor names is one the injector replaces in a spec; one taken from elsewhere is fixed for good. | review | [testing] |
