# Tests

> Governs specs and cases in TypeScript: the cases that prove exported types.

## General

### exported-type-proven-by-type-cases · SHOULD

Every exported generic or conditional type of a package others import is proven by type cases the compiler checks.

| Why |
|---|
| a consumer relies on what such a type computes, and nothing else fails when a change computes something else. |
