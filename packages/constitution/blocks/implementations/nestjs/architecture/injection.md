# Injection

> Governs how the injector hands a provider its dependencies, and the form an adapter takes for it.

## General

### providers-injected-through-the-constructor → unit-receives-its-dependencies-by-contract · MUST

A provider, a controller or a guard takes its dependencies through its constructor. They are `private readonly` parameters of the constructor, and a module's providers are its registrations; none builds a dependency, reaches a global or asks the injector for one, by `ModuleRef`'s `get` or `resolve` or by `DiscoveryService`'s scan of the providers.

| Why |
|---|
| a dependency the constructor names is one the injector replaces in a spec, while one built, taken from a global or asked for at run time appears in no constructor and no module, so it is fixed for good and neither a reader nor a spec sees it until it fails. |

### ports-injected-by-token → container-holds-only-registrations-the-root-declares · MUST

A dependency that stands for a port is injected by a token. The token is a `Symbol`, or a class with no member that serves only as the token, named by `@Inject` and bound to its implementation with `useClass` or `useFactory` in a module's `providers: [...]`; the parameter's type is the port, which is never the token itself, and a constructor never names a concrete adapter class.

| Why |
|---|
| a constructor that names a concrete adapter class fixes it for every caller, so the modules' providers no longer name every concrete choice and a spec cannot bind a fake in its place — the dependency inversion principle. |

### adapter-is-an-injectable-class → adapter-builds-no-client-as-its-module-loads · MUST

An adapter is an `@Injectable()` class.

| Why |
|---|
| an adapter in another form is assembled apart from every other part the injector builds, by hand beside the container, and replaced in a spec in a way of its own. |
