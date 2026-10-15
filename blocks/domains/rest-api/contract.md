# Contract

> Governs the OpenAPI document and the version.

## Contract

### contract-published-as-openapi → contract-published-machine-readable · MUST
The contract of a REST API is an OpenAPI document of version 3.1 or later, with every problem type it answers.

| Why | Tags |
|---|---|
| callers, generated clients and checks all read one machine-readable contract, and a server that drifts from it fails a spec, not a caller. | [testing] |

### version-named-once-by-its-major · SHOULD
Every path begins with the API's major from its first release — `/v1/orders` — and nowhere else names it; a new major comes only with a breaking change.

| Why | Tags |
|---|---|
| a version in the path shows in every log, cache key, route and link, and one scheme for every API leaves no caller unsure what it gets; versions kept for breaking changes alone stay few. | [] |

### retired-field-marked-deprecated-in-the-openapi-document → retired-operation-announced-before-removal · MUST
A field being retired is marked `deprecated` in the OpenAPI document, naming its replacement and its removal date.

| Why | Tags |
|---|---|
| a field has no header of its own, so the contract is where a caller and a generated client learn it is going. | [] |
