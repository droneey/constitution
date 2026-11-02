# Access control

> Governs the identity a message acts for.

## Identity

### message-carries-the-identity-it-acts-for → tenant-data-scoped-in-every-read-and-write · MUST

A message carries the identity it acts for, and its consumer acts only within that identity's rights. The identity is the person or the tenant it triggers work for; its consumer checks access and scopes every read and write by that identity, never by the wider rights of its own service identity alone.

| Why |
|---|
| the consumer's own identity can reach every tenant, so work done with it alone runs with rights the person who caused it never had — least privilege. |
