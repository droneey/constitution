# Compiler options

> Governs the type gate and the compiler's strict options.

## General

### compiler-is-the-type-gate → rule-held-by-a-tool-where-one-can · MUST

The compiler is the type gate, not a bundler or the runtime.

#### Why

A bundler strips the types without checking them, so a build can pass with every type wrong.

#### Examples

```json title="Avoid"
{
  "scripts": {
    "check:types": "vite build"
  }
}
```

```json title="Prefer"
{
  "scripts": {
    "check:types": "tsc --build"
  }
}
```

### compiler-strict-options-set → rule-held-by-a-tool-where-one-can · MUST

Every unit's compiler configuration sets the strict options — `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`.

#### Why

An option left unset lets the compiler pass what the rules it holds forbid, such as an index read that may miss with no check or an override with no keyword, so the gate passes code those rules refuse.

#### Examples

```json title="Avoid"
{
  "compilerOptions": {
    "strict": true
  }
}
```

```json title="Prefer"
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true
  }
}
```
