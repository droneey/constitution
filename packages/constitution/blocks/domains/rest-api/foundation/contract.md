# Contract

> Governs the OpenAPI document and the version.

## General

### contract-published-as-openapi → contract-published-machine-readable · MUST

The contract of a REST API is an OpenAPI document of version 3.1 or later, with every problem type it answers.

| Why |
|---|
| callers, generated clients and checks all read one machine-readable contract, and a server that drifts from it fails a spec, not a caller. |

### answer-enumeration-a-string-of-known-values → answer-enumeration-extensible-in-the-contract · MUST

An enumeration in an answer is declared in the OpenAPI document as a string whose known values it lists, never as a closed `enum`.

| Why |
|---|
| a generator and a validator read a JSON Schema `enum` as closed, so the first value added fails every client built before it. |

### version-named-once-by-its-major · SHOULD

Every path begins with the API's major from its first release — `/v1/orders` — and nowhere else names it; a new major comes only with a breaking change.

| Why |
|---|
| a version in the path shows in every log, cache key, route and link, and one scheme for every API leaves no caller unsure what it gets; versions kept for breaking changes alone stay few. |

### retired-field-marked-deprecated-in-the-openapi-document → retired-operation-announced-before-removal · MUST

A field being retired is marked `deprecated` in the OpenAPI document, naming its replacement and its removal date.

| Why |
|---|
| a field has no header of its own, so the contract is where a caller and a generated client learn it is going. |
