# Security events

> Governs the audit record of a security event, the store it leaves for and the alert it raises.

## General

### security-event-recorded · MUST

Every security event is recorded in an audit record. Security events include a sign-in, a failed sign-in, a sign-out, a change of credentials, a grant or revocation of rights and a refused access.

| Why |
|---|
| an attack shows itself only in the events it leaves, and an event nobody recorded cannot be investigated. |

### audit-record-kept-beyond-the-programs-reach · MUST

Every audit record leaves the program for a store the program cannot change or delete. It stays beyond the program's reach until the retention period the project sets for audit records ends.

| Why |
|---|
| an intruder who takes the program erases a record it can reach, and with it the attack it recorded, while a store that never lets the record go keeps personal data past its retention. |

### repeated-refusals-alerted · SHOULD

Every run of failed sign-ins or refused accesses past a bound the project sets raises an alert. The alert reaches whoever answers for the system's security.

| Why |
|---|
| an attack guessing passwords or probing rights shows as a run of refusals long before it succeeds, and a record nobody is told about is read only after the harm. |
