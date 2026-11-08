# Access

> Governs what a caller may do and see.

## Decisions

### access-denied-unless-granted · MUST

Every access no rule grants is denied.

| Why |
|---|
| access open by default is open wherever someone forgot a rule — fail-safe defaults. |

### operation-access-checked-on-every-call · MUST

Every operation checks its caller's rights itself, on every call, whichever way the call arrives. Hiding an operation from a caller who lacks the right never stands in for the check.

| Why |
|---|
| a caller who finds the address of an operation the interface hides calls it directly, and a check left to one way in is skipped by every other — complete mediation. |

### way-in-adds-no-rights-check · SHOULD

No way into an operation adds a rights check of its own beside the operation's.

| Why |
|---|
| a check a way in adds beside the operation's is a second copy of the rule, which drifts from it, and reads as the one check to whoever reviews that way in. |

## Objects and tenants

### object-access-checked-against-the-caller · MUST

Every access to an object a request names by its identifier is checked against the caller on every request. Such an object is an order or a patient's record, for one, and being signed in grants no object.

| Why |
|---|
| a caller who changes the identifier in a request otherwise reads or changes someone else's object — the OWASP API Security Top 10. |

### hidden-object-answered-as-not-found · MUST

Every object its caller may not see is answered exactly as an object that does not exist. A refusal of access answers only an operation the caller may not perform on an object it may see, or one that names no object. Exempt: a program that declares it refuses alike every identifier its caller has no right to, checking the right before the lookup.

| Why |
|---|
| a refusal given only to objects that exist confirms that the object exists, and either answer given alike to all hides it. |

### tenant-data-scoped-to-the-callers-tenant · MUST

Where the program serves several tenants, every read and every write of a tenant's data is scoped to the caller's tenant. The scope is set where the read or the write is made, so none reaches another tenant's data.

| Why |
|---|
| one read that forgets the scope shows one customer's data to another. |

### answer-fields-filtered-by-the-callers-rights · MUST

Every answer carries only the fields of an object its caller may see.

| Why |
|---|
| a caller allowed to see an object is not allowed every field of it, and one field too many leaks what the object hides. |

### written-fields-limited-by-the-callers-rights · MUST

Every write changes only the fields of an object its caller may change.

| Why |
|---|
| a caller allowed to change an object is not allowed every field of it, and one field too many lets it raise its own rights or change what others own. |

## Caches

### caller-shaped-result-never-served-from-a-cache-to-another · MUST

No result shaped by its caller is ever served from a cache to another caller. That holds for a result its caller's rights or tenant decide, which the cache keeps for that caller alone or keys by all that shaped it.

| Why |
|---|
| a result drawn from one caller's rights and served from a cache to the next hands over what the second could never read, with no check of access ever run. |

## Proof

### operation-access-proven-by-a-case → declared-failure-has-a-case · MUST

Every operation an outside caller reaches has a case that calls it as a caller its access refuses. Such an operation is a route, an endpoint, a subcommand or a tool. Exempt: an operation open to every caller, declared so where the operation is defined.

| Why |
|---|
| an operation that forgot its rule reads like every other in review, and without a case that calls it as a refused caller it ships open. |
