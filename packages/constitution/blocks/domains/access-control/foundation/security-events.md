# Security events

> Governs the record of a security event and the alert it raises.

## General

### security-event-recorded · MUST

A security event is recorded with who, what, when and from where, in a store the program cannot change. Security events include a sign-in, a failed sign-in, a sign-out, a change of credentials, a grant or revocation of rights and a refused access, and each record leaves the program for a store the program cannot change or delete.

| Why |
|---|
| an attack shows itself only in the events it leaves, an event nobody recorded cannot be investigated, and a record an intruder can erase hides the attack it recorded. |

### repeated-refusals-alerted · SHOULD

A run of failed sign-ins or refused accesses raises an alert. Once the run passes a bound the project sets, the alert reaches whoever answers for the system's security.

| Why |
|---|
| an attack guessing passwords or probing rights shows as a run of refusals long before it succeeds, and a record nobody is told about is read only after the harm. |
