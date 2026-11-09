# Data

> Governs JSON that is machine text: the form of its instants, its exact quantities and its large integers.

## Data written as text

### utc-instant-ends-in-z → instant-written-as-an-rfc-3339-date-time · MUST

In JSON that is machine text, every zero-offset instant is a `date-time` ending in `Z`, never `+00:00`. Exempt: a time a person sets, written with its offset and its zone, which `person-set-time-written-with-its-zone` governs, and a time form an outside format or protocol fixes.

#### Why

JSON has no type for a time, so a reader that does not parse the string compares it as text, and one instant spelled `+00:00` by one writer and `Z` by another compares unequal, while a time a person set in a zone at offset zero, such as London's in winter, carries `+00:00` as its place's own offset, which `Z` would deny — RFC 3339 and RFC 9557.

#### Examples

```json title="Avoid"
{
  "orderId": "ord_1042",
  "placedAt": "2026-11-08T14:30:00+00:00",
  "paidAt": "2026-11-08T14:31:12Z"
}
```

```json title="Prefer"
{
  "orderId": "ord_1042",
  "placedAt": "2026-11-08T14:30:00Z",
  "paidAt": "2026-11-08T14:31:12Z"
}
```

### exact-quantity-written-as-a-decimal-string → exact-quantity-written-as-a-decimal · MUST

In JSON that is machine text, every exact quantity is a decimal string or an integer of its smallest unit. It is never a number with a fraction. Exempt: a form an outside format or protocol fixes.

#### Why

Most JSON parsers read a number as a binary float, so `0.1` arrives as something else before the reader's code can turn it into a decimal — RFC 8259.

#### Examples

```json title="Avoid"
{
  "invoiceId": "inv_2207",
  "total": { "amount": 19.99, "currency": "EUR" }
}
```

```json title="Prefer"
{
  "invoiceId": "inv_2207",
  "total": { "amount": "19.99", "currency": "EUR" }
}
```

### large-integer-written-as-a-string · MUST

In JSON that is machine text, every integer that can exceed 2^53 − 1 is a string. Such integers include a 64-bit identifier and a count of bytes. Exempt: a form an outside format or protocol fixes.

#### Why

Many parsers read a JSON number as a double and round a larger integer in silence, so an identifier arrives as another one — RFC 8259.

#### Examples

```json title="Avoid"
{
  "orderId": 1853020494813093889,
  "lineCount": 3
}
```

```json title="Prefer"
{
  "orderId": "1853020494813093889",
  "lineCount": 3
}
```
