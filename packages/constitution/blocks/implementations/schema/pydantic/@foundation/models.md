# Models

> Governs a pydantic model: how strict it is, whether it changes, the secrets it holds, the values it builds and the failures of their checks, and the forms of pydantic's API it uses.

## General

### own-shape-model-strict-by-its-config-dict → own-shape-parsed-strictly · MUST

Every pydantic model of a shape the program owns sets `ConfigDict(extra='forbid', strict=True)`. Each value whose outside form is a string, such as a `UUID`, a `datetime`, a `date`, a `Decimal` or an enumeration, sets `Field(strict=False)` on its own type, whether it is a field or an item or key of a field's collection, as `list[Annotated[UUID, Field(strict=False)]]` does. Exempt: a model of a shape that another version of the program also writes, such as a stored record or a message between its instances, which keeps `extra='ignore'` and leaves `strict` off.

#### Why

Pydantic otherwise drops an unknown key and converts a value of another type, so the program's own shape passes with what the program does not know; `extra='forbid'` fails on the key and `strict=True` on the value; a server framework that parses a body after decoding its JSON hands strict mode the string that is the JSON form of such a value, which it refuses, so that value alone stays lax; `Field(strict=False)` on a collection reaches none of its items, which keep the model's strict mode.

#### Examples

```py title="Avoid"
class PlaceOrderBody(BaseModel):
    model_config = ConfigDict(frozen=True)

    cart_id: UUID
    quantity: int
```

```py title="Prefer"
class PlaceOrderBody(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, frozen=True)

    cart_id: Annotated[UUID, Field(strict=False)]
    quantity: int
```

### other-partys-shape-model-ignores-extra → other-partys-shape-parsed-tolerantly · MUST

Every pydantic model of a shape another party owns keeps `extra='ignore'`, never `extra='forbid'`.

#### Why

A model that refuses an unknown key breaks on the next release of the party that owns the shape, as soon as it adds a field the program never reads.

#### Examples

```py title="Avoid"
class StripeChargeDto(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    id: str
    amount: int
    status: str
```

```py title="Prefer"
class StripeChargeDto(BaseModel):
    model_config = ConfigDict(extra="ignore", frozen=True)

    id: str
    amount: int
    status: str
```

### models-frozen → value-immutable-by-default · SHOULD

Every pydantic model sets `frozen=True` in its `ConfigDict`.

#### Why

A pydantic model that can change after its parse holds a value its check never saw, and every holder of it sees the change.

#### Examples

```py title="Avoid"
class ShipmentDto(BaseModel):
    model_config = ConfigDict(extra="ignore")

    tracking_number: str
```

```py title="Prefer"
class ShipmentDto(BaseModel):
    model_config = ConfigDict(extra="ignore", frozen=True)

    tracking_number: str
```

### secrets-typed-secret-str → secret-kept-out-of-output · MUST

Every secret a pydantic model holds is typed `SecretStr`. Such a secret is a token, a password or a key.

#### Why

A secret typed `str` prints and serialises in clear, so a pydantic model logged or dumped whole leaks it, while `SecretStr` prints and serialises as asterisks.

#### Examples

```py title="Avoid"
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SHOP_", frozen=True)

    stripe_api_key: str
```

```py title="Prefer"
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SHOP_", frozen=True)

    stripe_api_key: SecretStr
```

### pydantic-v1-forms-never-used → deprecated-form-never-used · MUST

Every pydantic model uses only pydantic 2's forms, never pydantic 1's. The first are such as `model_config = ConfigDict(...)`, `field_validator` and `model_validator`, `model_validate` and `model_validate_json`, `model_dump` and `model_dump_json`, and `model_copy`; the second such as a nested `class Config`, `validator`, `root_validator`, `parse_obj`, `parse_raw`, `dict()`, `json()`, `copy()` and the `pydantic.v1` module.

#### Why

Code on the old forms breaks when pydantic removes them, as it deprecated them to do.

#### Examples

```py title="Avoid"
class CartDto(BaseModel):
    class Config:
        extra = "ignore"
        frozen = True

    lines: list[CartLineDto]


cart = CartDto.parse_raw(body)
```

```py title="Prefer"
class CartDto(BaseModel):
    model_config = ConfigDict(extra="ignore", frozen=True)

    lines: list[CartLineDto]


cart = CartDto.model_validate_json(body)
```

### model-builds-values-through-their-own-check → parsed-value-built-through-its-own-check · MUST

Every pydantic model builds a value that keeps an invariant through the value's dataclass, in an `AfterValidator` or a `field_validator`.

#### Why

A validator that checks the invariant itself, or a field typed by a second definition of the value, drifts from the dataclass's own check, so the model accepts values the program refuses — a single source of truth.

#### Examples

```py title="Avoid"
class RefundBody(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, frozen=True)

    amount: Annotated[Decimal, Field(strict=False, gt=0, decimal_places=2)]
```

```py title="Prefer"
class RefundBody(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True, frozen=True)

    amount: RefundAmount

    @field_validator("amount", mode="before")
    @classmethod
    def _build_amount(cls, value: str) -> RefundAmount:
        return to_refund_amount(value)
```

### check-failure-raised-as-a-value-error → check-failure-reported-as-a-parse-problem · MUST

Every failure of a value's own check inside a pydantic model is raised again as a `ValueError` or a `PydanticCustomError`.

#### Why

Pydantic lists only a `ValueError`, an `AssertionError` or a `PydanticCustomError` in its `ValidationError`, so a value's own error raised as it is escapes the parse unlisted.

#### Examples

```py title="Avoid"
def to_refund_amount(value: str) -> RefundAmount:
    return RefundAmount.parse(value)
```

```py title="Prefer"
def to_refund_amount(value: str) -> RefundAmount:
    try:
        return RefundAmount.parse(value)
    except InvalidRefundAmountError as error:
        raise ValueError(error.code) from error
```
