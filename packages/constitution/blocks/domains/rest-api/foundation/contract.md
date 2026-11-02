# Contract

> Governs the OpenAPI document, the version, and how an operation or a field is retired.

## General

### contract-published-as-openapi → contract-published-machine-readable · MUST

The contract of a REST API is an OpenAPI document of version 3.1 or later, with every problem type it answers.

| Why |
|---|
| a contract in a format no standard tool reads gets no generated client and no check, so each caller writes its client by hand and drifts from the server unseen — OpenAPI. |

### answer-enumeration-a-string-of-known-values → answer-enumeration-extensible-in-the-contract · MUST

An enumeration in an answer is declared in the OpenAPI document as a string whose known values it lists, never as a closed `enum`.

| Why |
|---|
| a generator and a validator read a JSON Schema `enum` as closed, so the first value added fails every client built before it. |

### version-named-once-by-its-major · SHOULD

A REST API names its major version once, at the head of every path. Every path begins with the major from the first release, and nowhere else names it; a new major comes only with a breaking change.

| Why |
|---|
| a version named in a header or a parameter is invisible in logs, cache keys, routes and links, so a cache serves one version's answer for another, and versions cut for changes that break nothing multiply what every caller must choose between. |

## Retirement

### retired-field-marked-deprecated-in-the-openapi-document → retired-operation-announced-before-removal · MUST

A field being retired is marked `deprecated` in the OpenAPI document, naming its replacement and its removal date.

| Why |
|---|
| a field has no header of its own, so one retired without the mark in the contract disappears from under a caller and a generated client that never learned it was going — OpenAPI. |

### retired-operation-answers-deprecation-headers → retired-operation-announced-before-removal · MUST

An operation being retired answers with `Deprecation` and `Sunset`. They are `Deprecation` (RFC 9745) and `Sunset` (RFC 8594), the sunset no earlier than the deprecation, beside a `Link` with `rel="deprecation"` to its notice.

| Why |
|---|
| a retirement announced only in documents is missed by a caller's monitoring, which first learns of it from the removal that breaks it — RFC 9745 and RFC 8594. |
