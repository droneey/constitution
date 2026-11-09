# Validation

> Governs how a validation error becomes details.

## General

### validation-errors-become-error-details → parse-failure-never-repeats-the-rejected-value · MUST

Each entry of a parse's `ValidationError` becomes a detail by its `loc`, the path, and its `type`, the reason, alone. It is read by `errors(include_input=False, include_context=False)`, which drops each entry's `input` and `ctx`, and no detail carries its `msg`.

#### Why

An entry's `input` is the rejected value, a password or a card number among them, its `ctx` may quote it and so may its `msg`, as `union_tag_invalid`'s does with the tag it refused, so a detail read with any of them leaks that value to whoever the failure reaches.

#### Examples

```py title="Avoid"
except ValidationError as error:
    details = [
        {"path": entry["loc"], "message": entry["msg"], "input": entry["input"]}
        for entry in error.errors()
    ]
    raise InvalidInputError(details) from error
```

```py title="Prefer"
except ValidationError as error:
    details = [
        ErrorDetail(path=entry["loc"], reason=entry["type"])
        for entry in error.errors(include_input=False, include_context=False)
    ]
    raise InvalidInputError(details) from error
```
