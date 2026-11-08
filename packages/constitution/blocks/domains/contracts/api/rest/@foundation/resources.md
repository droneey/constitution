# Resources

> Governs how a resource is named and changed.

## Names

### resource-path-names-nouns · SHOULD

Every REST path names resources, never a verb. Exempt: an action no standard method expresses, which is a sub-resource or a custom method of its resource.

#### Why

A verb in a path hides an operation that ignores what its method means, so no caller can tell from the method what the operation does.

#### Examples

```text title="Avoid"
POST /v1/getOrder
POST /v1/createRefund
POST /v1/orders/ord-7/doCancel
```

```text title="Prefer"
GET  /v1/orders/ord-7
POST /v1/orders/ord-7/refunds
POST /v1/orders/ord-7:cancel
```

### collection-named-by-a-plural-noun · SHOULD

Every REST collection's path is a plural noun, followed by an item's identifier.

#### Why

A caller predicts every path from the nouns only when each collection is named alike, and a singular collection beside plural ones is guessed wrong.

#### Examples

```text title="Avoid"
GET /v1/order/ord-7
GET /v1/customers/cus-1
GET /v1/invoice-list
```

```text title="Prefer"
GET /v1/orders/ord-7
GET /v1/customers/cus-1
GET /v1/invoices
```

## Methods

### partial-update-sets-only-what-it-names · MUST

Every partial update of a REST resource sets only the fields it names. It is a `PATCH` in JSON Merge Patch (RFC 7396) or with a field mask naming what it sets, a field it leaves out stays as it was, and `null` clears one.

#### Why

A partial update whose body replaces the fields it does not mention erases what another caller wrote.

#### Examples

```text title="Avoid"
PUT /v1/customers/cus-1 HTTP/1.1
Content-Type: application/json
If-Match: "v7"

{ "email": "ann@example.com" }

phone and address are erased
```

```text title="Prefer"
PATCH /v1/customers/cus-1 HTTP/1.1
Content-Type: application/merge-patch+json
If-Match: "v7"

{ "email": "ann@example.com", "phone": null }
```
