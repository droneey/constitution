# Messaging with access control

> Governs the identity a message acts for.

## Identity

### message-carries-the-identity-it-acts-for → tenant-data-scoped-in-every-read-and-write · MUST
A message that triggers work for a person or a tenant carries the identity it acts for, and its consumer checks access and scopes every read and write by that identity, never by the wider rights of its own service identity alone.

| Why | Tags |
|---|---|
| the consumer's own identity can reach every tenant, so work done with it alone runs with rights the person who caused it never had. | [security] |
