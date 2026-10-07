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
