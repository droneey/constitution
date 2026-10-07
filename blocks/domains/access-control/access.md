# Access

> Governs what a caller may do and see.

## Decisions

### access-denied-unless-granted · MUST
Access is denied unless a rule grants it.

| Why | Tags |
|---|---|
| access open by default is open wherever someone forgot a rule. | [security] |

### function-access-checked-on-every-call · MUST
Access to an operation is checked against the caller's rights by the operation itself, on every call; an operation hidden from a caller who lacks the right is not thereby refused.

| Why | Tags |
|---|---|
| a caller who finds the address of an operation the interface hides calls it directly. | [security] |

## Objects and tenants

### object-access-checked-against-the-caller · MUST
Access to an object a request names — an order by its identifier — is checked against the caller on every request; being signed in grants no object.

| Why | Tags |
|---|---|
| a caller who changes the identifier in a request otherwise reads or changes someone else's object, the most common flaw of an API. | [security] |

### tenant-data-scoped-in-every-read-and-write · MUST
In a program that serves several tenants, every read and write of a tenant's data is scoped to the caller's tenant where it is made, so none can reach another tenant's data.

| Why | Tags |
|---|---|
| one read that forgets the scope shows one customer's data to another. | [security, data] |

### answer-fields-filtered-by-the-callers-rights · MUST
An answer carries only the fields the caller may see, and a write changes only the fields the caller may change.

| Why | Tags |
|---|---|
| a caller allowed to see an object is not allowed every field of it, and one field too many leaks what the object hides. | [security] |

## Proof

### operation-access-proven-by-a-case → declared-failure-has-a-case · MUST
The access of each operation a caller outside the program can reach — a route, an endpoint, a command, a tool — is proven by a case for a caller it grants and one for a caller it refuses.

| Why | Tags |
|---|---|
| only a case notices the operation that forgot its rule. | [security, testing] |
