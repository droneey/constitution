# Responses

> Governs how a response body is parsed.

## General

### ky-body-parsed-by-schema → outside-value-unknown-until-parsed · MUST

A response body is parsed by a schema, never typed by `.json<T>()`. It is read by `.json()` with no type argument and then parsed.

| Why |
|---|
| `.json<T>()` only names a type and checks nothing, so a body the server changed reaches the program typed as what it no longer is — parse, don't validate. |
