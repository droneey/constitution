# Contract

> Governs the OpenAPI document, the version, and how an operation or a field is retired.

## General

### contract-published-as-openapi → contract-published-machine-readable · MUST

Every REST API publishes its contract as an OpenAPI document of version 3.1 or later.

| Why |
|---|
| a contract in a format no standard tool reads gets no generated client and no check, so each caller writes its client by hand and drifts from the server unseen, and a version before 3.1 holds no full JSON Schema. |

### answer-enumeration-a-string-of-known-values → enumeration-in-a-shared-format-declared-extensible · MUST

Every enumeration in a REST answer is declared in the OpenAPI document as a string that lists its known values. It lists them in its `examples`, or in an `anyOf` of a closed `enum` of them and a plain string, never in a closed `enum` alone. Exempt: a set complete by its meaning, such as a sort direction, which stays a closed `enum`.

| Why |
|---|
| a generator and a validator read a JSON Schema `enum` as closed, so the first value added fails every client built before it, and a list of known values each team writes its own way is read by each generator its own way — Zalando's API guidelines. |

### version-named-once-by-its-major · SHOULD

Every REST API names its major version once, at the head of every path, from its first release. No header, parameter or other part of a request names it.

| Why |
|---|
| a version named in a header or a parameter is invisible in logs, cache keys, routes and links, so a cache serves one version's answer for another. |

### major-version-raised-only-by-a-breaking-change · SHOULD

Every new major version of a REST API comes only with a breaking change.

| Why |
|---|
| versions cut for changes that break nothing multiply what every caller must choose between. |

## Retirement

### retired-field-marked-deprecated-in-the-openapi-document → retired-operation-announced-before-removal · MUST

Every field a REST API retires is marked `deprecated` in its OpenAPI document, naming its replacement and its removal date.

| Why |
|---|
| a field has no header of its own, so one retired without the mark in the contract disappears from under a caller and a generated client that never learned it was going. |

### retired-operation-answers-deprecation-headers → retired-operation-announced-before-removal · MUST

Every REST operation being retired answers with `Deprecation` (RFC 9745) and `Sunset` (RFC 8594), its sunset no earlier than its deprecation.

| Why |
|---|
| a retirement announced only in documents is missed by a caller's monitoring, which first learns of it from the removal that breaks it — RFC 9745 and RFC 8594. |

### retired-operation-links-its-notice · SHOULD

Every REST operation being retired answers with a `Link` of `rel="deprecation"` to its notice.

| Why |
|---|
| a caller whose monitoring finds the headers learns no reason, replacement or plan without the notice they point to — RFC 9745. |
