# Responses

> Governs how a response body is parsed.

## General

### response-body-parsed-from-its-bytes → outside-value-object-until-parsed · MUST

A response body is parsed from its bytes, never through `response.json()`. The parse reads `response.content`, after `raise_for_status()`, by the schema of the body's shape.

| Why |
|---|
| `response.json()` returns `Any`, which switches the type checker off for every value read from the body — parse, don't validate. |
