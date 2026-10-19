# Security events

> Governs the record of a security event and the alert it raises.

## General

### security-event-recorded · MUST

A security event — a sign-in, a failed sign-in, a sign-out, a change of credentials, a grant or revocation of rights, a refused access — is recorded with who, what, when and from where, and leaves the program for a store the program cannot change or delete.

| Why | Tags |
|---|---|
| an attack shows itself only in the events it leaves, an event nobody recorded cannot be investigated, and a record an intruder can erase, or that nobody watches, shows the attack only once it is over. | [security] |

### security-event-alerted · SHOULD

A run of failed sign-ins or refused accesses past a bound the project sets raises an alert to whoever answers for the system's security.

| Why | Tags |
|---|---|
| an attack guessing passwords or probing rights shows as a run of refusals long before it succeeds, and a record nobody is told about is read only after the harm. | [security] |
