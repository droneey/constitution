# pydantic with convergence

> The schema of a converged document, published for its editors.

### json-schema-from-pydantic → published-schema-generated-from-code
The published JSON Schema is built from the document's model by `model_json_schema()`, or by `TypeAdapter(...).json_schema()` for a union.

| Why | Tags |
|---|---|
| the schema editors read then comes from the code, and cannot drift from it. | [] |
