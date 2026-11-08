# Values

> Governs the values a schema builds and the failures of their checks.

## General

### parsed-value-built-through-its-own-check → invariant-checked-at-construction · MUST

Every schema builds a value that keeps an invariant only through that value's own check. It never restates the check nor defines the value a second time.

#### Why

A check copied into a schema drifts from the value's own, and a second definition of the value skips it, so the schema accepts values the program refuses — a single source of truth.

#### Examples

```py title="Avoid"
class OrderLineDto(BaseModel):
    model_config = ConfigDict(extra="ignore", frozen=True)

    sku: Annotated[str, Field(pattern=r"^[A-Z]{3}-\d{4}$")]
```

```py title="Prefer"
class OrderLineDto(BaseModel):
    model_config = ConfigDict(extra="ignore", frozen=True)

    sku: Sku

    @field_validator("sku", mode="before")
    @classmethod
    def _build_sku(cls, value: str) -> Sku:
        return to_sku(value)
```

### check-failure-reported-as-a-parse-problem → parse-failure-lists-every-problem · MUST

Every failure of a value's own check in a parse is reported as one of the parse's problems. It is listed with the input's other problems, never thrown.

#### Why

A failure that escapes the parse as the value's own error is missing from the problems its caller is shown, and reaches the caller as a throw where it expected a result.

#### Examples

```py title="Avoid"
def to_sku(value: str) -> Sku:
    return Sku(value)
```

```py title="Prefer"
def to_sku(value: str) -> Sku:
    try:
        return Sku(value)
    except InvalidSkuError as error:
        raise PydanticCustomError(error.code, "invalid SKU") from error
```
