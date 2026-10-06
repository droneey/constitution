# ts-reset

### reset-loaded-in-applications → no-any
An application loads ts-reset once, from `src/reset.d.ts`, so `JSON.parse` and a response body's `json()` return `unknown`, not `any`; a published package never loads it.

| Why | Tags |
|---|---|
| the standard library types them `any`, which neither the compiler nor the lint reports; a package that loads it changes the types of every program that installs it. | [] |
