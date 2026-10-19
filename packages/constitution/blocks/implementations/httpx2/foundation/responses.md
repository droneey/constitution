# Responses

> Governs how a response body is parsed.

## General

### response-body-parsed-by-its-model → boundary-values-object-until-parsed · MUST

A response body is parsed by its model from `response.content`, after `raise_for_status()`; `response.json()` is never called.

| Why | Tags |
|---|---|
| `response.json()` returns `Any`, which switches the type checker off for every value read from the body. | [] |
