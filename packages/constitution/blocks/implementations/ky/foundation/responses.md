# Responses

> Governs how a response body is parsed.

## General

### ky-body-parsed-by-schema → boundary-values-unknown-until-parsed · MUST

A response body is read by `.json()` with no type argument and parsed by a schema; `.json<T>()` is forbidden.

| Why |
|---|
| `.json<T>()` only names a type and checks nothing. |
