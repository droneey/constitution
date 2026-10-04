# ty with pydantic

## deprecated-pydantic-forms-fail-the-types → pydantic-two-forms-only
The forms pydantic 2 marks deprecated — `validator`, `root_validator`, `parse_obj`, `parse_raw`, `dict()`, `json()`, `copy()` — fail the type check as `deprecated`, which the part makes an error.

| Why | Check | Tags |
|---|---|---|
| pydantic marks each with `@deprecated`, which ty reports wherever it is called; an inner `class Config` and the `pydantic.v1` module carry no such mark and stay with the review. | tool/types | [] |
