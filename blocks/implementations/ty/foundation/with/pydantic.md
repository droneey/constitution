# ty with pydantic

## deprecated-pydantic-forms-fail-the-types → pydantic-two-forms-only
ty holds the forms pydantic 2 marks deprecated — `validator`, `root_validator`, `parse_obj`, `parse_raw`, `dict()`, `json()`, `copy()` — through `deprecated-calls-fail-the-types`; an inner `class Config` and the `pydantic.v1` module carry no such mark and stay with the review.

| Why | Check | Tags |
|---|---|---|
| pydantic marks each with `@deprecated`, which ty reports wherever it is called. | tool/types | [] |
