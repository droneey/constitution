# Validation

> Governs how a validation error becomes details.

## General

### validation-errors-become-error-details → parse-failure-lists-every-problem · SHOULD

Input is parsed by `model_validate` or `model_validate_json`, and each entry of the `ValidationError` it raises becomes a detail, its `loc` the path and its `type` the reason, read by `errors(include_input=False)`.

| Why | Tags |
|---|---|
| `include_input=False` keeps the rejected values out of the entries pydantic returns. | [errors, security] |
