# JavaScript runtime

> Governs the compiler's mirror of the aliases `package.json` declares.

## General

### paths-mirror-package-imports → alias-declared-in-package-imports · MUST

The `paths` of `tsconfig.json` repeat the aliases of `imports` word for word, and only them.

#### Why

A runtime resolves an alias through `imports`, or a `#/` alias only through `paths`, and the compiler, by its release and its resolution mode, through `paths`, so an alias declared in one alone resolves in the editor and fails at run time, or the reverse.

#### Examples

```jsonc title="Avoid"
{
  "compilerOptions": {
    "paths": {
      "#src/*": ["./src/*"],
      "@/*": ["./src/*"] // no such alias in the imports of package.json
    }
  }
}
```

```jsonc title="Prefer"
{
  "compilerOptions": {
    "paths": {
      "#src/*": ["./src/*"]
    }
  }
}
```
