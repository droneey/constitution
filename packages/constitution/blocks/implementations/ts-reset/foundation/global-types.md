# Global types

> Governs the types of what is parsed or fetched.

## General

### reset-loaded-in-applications → any-never-written · MUST

An application loads ts-reset once, from `src/reset.d.ts`, so `JSON.parse` and a response body's `json()` return `unknown`, not `any`; a published package never loads it.

| Why |
|---|
| the standard library types them `any`, which neither the compiler nor the lint reports; a package that loads it changes the types of every program that installs it. |
