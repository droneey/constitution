# Responses

> Governs how an answer's status is checked and its body parsed.

## General

### answer-status-raised-before-its-body-parsed · MUST

Every answer's status is checked by `raise_for_status()` before its body is parsed.

#### Why

Httpx2 raises nothing for a `4xx` or `5xx` answer by itself, so a body parsed first reads an error's body by the shape of a success, and the failure the answer carries reaches its caller as a parse problem or as a value.

#### Examples

```py title="Avoid"
async def charge(self, amount: Cents) -> PaymentReference:
    response = await self._client.post("/charges", json={"amount": amount})
    return parse_charge(response.content).reference
```

```py title="Prefer"
async def charge(self, amount: Cents) -> PaymentReference:
    response = await self._client.post("/charges", json={"amount": amount})
    response.raise_for_status()
    return parse_charge(response.content).reference
```

### response-body-parsed-from-its-bytes → outside-value-typed-object-until-parsed · MUST

Every response body is parsed from its bytes, never through `response.json()`. The parse reads `response.content` by the schema of the body's shape.

#### Why

`response.json()` returns `Any`, which switches the type checker off for every value read from the body — parse, don't validate.

#### Examples

```py title="Avoid"
async def charge(self, amount: Cents) -> PaymentReference:
    response = await self._client.post("/charges", json={"amount": amount})
    response.raise_for_status()
    return PaymentReference(response.json()["reference"])
```

```py title="Prefer"
async def charge(self, amount: Cents) -> PaymentReference:
    response = await self._client.post("/charges", json={"amount": amount})
    response.raise_for_status()
    return ChargeAnswer.model_validate_json(response.content).reference
```
