# Global types

> Governs the types of what is parsed or fetched.

## General

### reset-loaded-only-by-programs → unchecked-type-never-used · MUST

ts-reset is loaded only by a program, once. A program, which no package imports, loads it from `src/reset.d.ts`, so `JSON.parse` and a response body's `json()` return `unknown`, not `any`, and a published package never loads it.

| Why |
|---|
| the standard library types them `any`, which neither the compiler nor the lint reports, so outside data spreads through the program unchecked; a package that loads it changes the types of every program that installs it. |
