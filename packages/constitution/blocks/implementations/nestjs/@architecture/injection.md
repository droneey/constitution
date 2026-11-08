# Injection

> Governs how the injector hands a provider its dependencies, the form an adapter takes for it, and how a spec replaces one.

## General

### providers-injected-through-the-constructor → unit-handed-its-dependencies · MUST

Every provider, controller and guard takes its dependencies through its constructor. None builds a dependency, reaches a global or asks the injector for one, by `ModuleRef`'s `get` or `resolve` or by `DiscoveryService`'s scan of the providers.

| Why |
|---|
| a dependency the constructor names is one the injector replaces in a spec, while one built, taken from a global or asked for at run time appears in no constructor and no module, so it is fixed for good and neither a reader nor a spec sees it until it fails. |

### ports-injected-by-token → unit-receives-its-dependencies-by-contract · SHOULD

Every dependency that stands for a port is injected by a token. The token is a `Symbol`, or a class with no member that serves only as the token, named by `@Inject` and bound to its implementation with `useClass` or `useFactory` in a module's `providers: [...]`, and it is never the parameter's type.

| Why |
|---|
| Nest injects a parameter without `@Inject` by its declared class, so a port, an interface gone at run time, reaches a constructor only through a token, and a constructor that names the adapter class instead fixes it for every caller — the dependency inversion principle. |

### adapter-is-an-injectable-class → program-uses-only-its-frameworks-container · MUST

Every adapter is an `@Injectable()` class.

| Why |
|---|
| an adapter in another form is assembled apart from every other part the injector builds, by hand beside the container, and replaced in a spec in a way of its own. |

### adapter-faked-through-override-provider → effect-faked-never-mocked · SHOULD

Every spec replaces an adapter by binding its token to a fake with `overrideProvider`.

| Why |
|---|
| an adapter replaced by patching its module or the import of it proves a program the injector never builds, and breaks when the module moves. |
