# Tests

> Governs the specs of a consumer under redelivery and reordering.

## Delivery

### redelivery-and-reordering-have-cases → edge-cases-chosen-by-risk · SHOULD
A consumer has a case that delivers one message twice and checks that its effect happened once, and, where order matters, a case that delivers two messages of one key out of order.

| Why | Tags |
|---|---|
| redelivery and reordering are rare on a developer's machine and certain in production, so only a case exercises them before a customer is charged twice. | [testing] |
