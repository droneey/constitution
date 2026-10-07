# Contract

> Governs the OpenAPI document and the version.

## Contract

### contract-published-as-openapi → contract-published-machine-readable · MUST
The contract of a REST API is an OpenAPI document of version 3.1 or later, with every problem type it answers.

| Why | Tags |
|---|---|
| callers, generated clients and checks all read one machine-readable contract, and a server that drifts from it fails a spec, not a caller. | [testing] |

### openapi-document-has-one-source → fact-has-one-source · MUST
The OpenAPI document is the source the server's shapes are generated from, or is generated from them — never written by hand beside them.

| Why | Tags |
|---|---|
| two hand-kept descriptions of one contract drift apart. | [] |

### version-named-once-by-its-major · SHOULD
A breaking version is a new major, named in the one place the API chose once — a prefix of its paths or one version parameter — and a request names its version explicitly.

| Why | Tags |
|---|---|
| minor versions in addresses and two schemes in one API leave callers unsure what they get. | [] |

### retired-field-marked-deprecated-in-the-openapi-document → retired-operation-announced-before-removal · MUST
A field being retired is marked `deprecated` in the OpenAPI document, naming its replacement and its removal date.

| Why | Tags |
|---|---|
| a field has no header of its own, so the contract is where a caller and a generated client learn it is going. | [] |

### answer-enumeration-open-in-the-openapi-document → answer-enumeration-declared-open · MUST
An enumeration in an answer is declared in the OpenAPI document as a string whose known values `x-extensible-enum` lists, never as a closed `enum`.

| Why | Tags |
|---|---|
| a generated client fails on a value outside a closed `enum`, so the first value added breaks every client generated before it. | [] |
