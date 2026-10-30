# Validation

> Governs how a validation error becomes details.

## General

### validation-errors-become-error-details → parse-failure-lists-every-problem · MUST

Input is parsed by `model_validate` or `model_validate_json`, and each entry of the `ValidationError` it raises becomes a detail, its `loc` the path and its `type` the reason, read by `errors(include_input=False, include_context=False)`, which drops each entry's `input` and `ctx`.

| Why |
|---|
| an entry's `input` is the rejected value, a password or a card number among them, and its `ctx` may quote it. |
