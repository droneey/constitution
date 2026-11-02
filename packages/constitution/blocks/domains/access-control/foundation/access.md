# Access

> Governs what a caller may do and see.

## Decisions

### access-denied-unless-granted · MUST

Access is denied unless a rule grants it.

| Why |
|---|
| access open by default is open wherever someone forgot a rule — fail-safe defaults. |

### operation-access-checked-on-every-call · MUST

Access to an operation is checked on every call, by the operation itself. The check weighs the caller's rights whichever way the call arrives, no way in adds a rights check of its own beside it, and hiding an operation from a caller who lacks the right never stands in for it.

| Why |
|---|
| a caller who finds the address of an operation the interface hides calls it directly, a check left to one way in is skipped by every other, and a check a way in adds beside the operation's is a second copy of the rule, which drifts from it — complete mediation. |

## Objects and tenants

### object-access-checked-against-the-caller · MUST

Access to an object a request names is checked against the caller on every request. The object is named by its identifier, as an order is, and being signed in grants no object.

| Why |
|---|
| a caller who changes the identifier in a request otherwise reads or changes someone else's object — the OWASP API Security Top 10. |

### hidden-object-answered-as-not-found · SHOULD

An object the caller may not see is answered as if it did not exist. The answer is exactly the one given for an object that does not exist, or, where the program declares it, every identifier the caller has no right to is refused alike, the right checked before the lookup. A refusal of access answers only an operation the caller may not perform on an object it may see.

| Why |
|---|
| a refusal given only to objects that exist confirms that the object exists, and either answer given alike to all hides it. |

### tenant-data-scoped-in-every-read-and-write · MUST

Every read and write of a tenant's data is scoped to the caller's tenant. In a program that serves several tenants, the scope is set where the read or the write is made, so none can reach another tenant's data.

| Why |
|---|
| one read that forgets the scope shows one customer's data to another. |

### answer-fields-filtered-by-the-callers-rights · MUST

A caller sees and changes only the fields its rights allow. An answer carries only the fields the caller may see, and a write changes only the fields the caller may change.

| Why |
|---|
| a caller allowed to see an object is not allowed every field of it, and one field too many leaks what the object hides. |

## Caches

### caller-shaped-result-never-served-from-a-cache-to-another · MUST

A result shaped by its caller is never served from a cache to another caller. That holds for a result its caller's rights or tenant decide: the cache keeps it for that caller alone, or is keyed by all that shaped it.

| Why |
|---|
| a result drawn from one caller's rights and served from a cache to the next hands over what the second could never read, with no check of access ever run. |

## Proof

### operation-access-proven-by-a-case → declared-failure-has-a-case · MUST

Each operation's access is proven by a case that grants it and one that refuses it. The operations are those a caller outside the program can reach — a route, an endpoint, a command, a tool.

| Why |
|---|
| an operation that forgot its rule reads like every other in review, and without a case that calls it as a refused caller it ships open. |
