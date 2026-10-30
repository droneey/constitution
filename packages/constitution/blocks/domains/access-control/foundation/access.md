# Access

> Governs what a caller may do and see.

## Decisions

### access-denied-unless-granted · MUST

Access is denied unless a rule grants it.

| Why |
|---|
| access open by default is open wherever someone forgot a rule. |

### operation-access-checked-on-every-call · MUST

Access to an operation is checked against the caller's rights on every call, at the operation's entry point; hiding an operation from a caller who lacks the right never stands in for the check.

| Why |
|---|
| a caller who finds the address of an operation the interface hides calls it directly. |

## Objects and tenants

### object-access-checked-against-the-caller · MUST

Access to an object a request names — an order by its identifier — is checked against the caller on every request; being signed in grants no object.

| Why |
|---|
| a caller who changes the identifier in a request otherwise reads or changes someone else's object, the most common flaw of an API. |

### hidden-object-answered-as-not-found · SHOULD

An object the caller may not see is answered as not found, as if it did not exist; where the program declares it, every identifier the caller has no right to is instead refused alike, the right checked before the object is looked up. Otherwise, a refusal of access is answered only for an operation the caller may not perform on an object it may see.

| Why |
|---|
| a refusal given only to objects that exist confirms that the object exists, and either answer given alike to all hides it. |

### tenant-data-scoped-in-every-read-and-write · MUST

In a program that serves several tenants, every read and write of a tenant's data is scoped to the caller's tenant where it is made, so none can reach another tenant's data.

| Why |
|---|
| one read that forgets the scope shows one customer's data to another. |

### answer-fields-filtered-by-the-callers-rights · MUST

An answer carries only the fields the caller may see, and a write changes only the fields the caller may change.

| Why |
|---|
| a caller allowed to see an object is not allowed every field of it, and one field too many leaks what the object hides. |

## Caches

### caller-shaped-result-never-served-from-a-cache-to-another · MUST

A result shaped by its caller — by their rights, their tenant or their own data — is never served from a cache to another caller: the cache keeps it for that caller alone or is keyed by all that shaped it.

| Why |
|---|
| a result drawn from one caller's rights and served from a cache to the next hands over what the second could never read, with no check of access ever run. |

## Proof

### operation-access-proven-by-a-case → declared-failure-has-a-case · MUST

The access of each operation a caller outside the program can reach — a route, an endpoint, a command, a tool — is proven by a case for a caller it grants and one for a caller it refuses.

| Why |
|---|
| only a case notices the operation that forgot its rule. |
