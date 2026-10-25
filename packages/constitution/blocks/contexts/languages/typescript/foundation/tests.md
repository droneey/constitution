# Tests

> Governs the cases that prove exported types.

## General

### exported-type-proven-by-type-cases · SHOULD

The exported generic and conditional types of a package others import are proven by type cases the compiler checks.

| Why |
|---|
| a consumer relies on what such a type computes, and nothing else fails when a change computes something else. |
