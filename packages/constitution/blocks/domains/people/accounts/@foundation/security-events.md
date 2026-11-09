# Security events

> Governs the audit record of a security event, the store it leaves for and the alert it raises.

## General

### security-event-recorded · MUST

Every security event is recorded in an audit record. Security events include a sign-in, a failed sign-in, a sign-out, a change to an account's email, password, factors or issued keys, a grant or revocation of rights and a refused access.

#### Why

An attack shows itself only in the events it leaves, and an event nobody recorded cannot be investigated.

#### Examples

```pseudo title="Avoid"
# accounts/application/use-cases/commands/revoke-role.use-case
function createRevokeRole({ accountRepository })
  return function(input, context)
    let account = accountRepository.find(input.accountId, context)

    call accountRepository.save(revoke(account, input.role), context)
```

```pseudo title="Prefer"
# accounts/application/use-cases/commands/revoke-role.use-case
function createRevokeRole({ accountRepository, auditRecords, clock })
  return function(input, context)
    let account = accountRepository.find(input.accountId, context)

    call accountRepository.save(revoke(account, input.role), context)
    call auditRecords.append({
      kind: RoleRevoked,
      accountId: account.id,
      role: input.role,
      by: context.caller.accountId,
      at: clock.now()
    }, context)
```

### audit-record-kept-beyond-the-programs-reach · MUST

Every audit record leaves the program for a store the program cannot change or delete. It stays beyond the program's reach until the retention period the project sets for audit records ends.

#### Why

An intruder who takes the program erases a record it can reach, and with it the attack it recorded, while a store that never lets the record go keeps personal data past its retention.

#### Examples

```text title="Avoid"
audit records
  store     table audit_records in the
            program's own database
  program   select, insert, update, delete
  kept      for ever
```

```text title="Prefer"
audit records
  store     write-once log store in a
            separate cloud account
  program   append only
  kept      400 days, the project's
            retention, then expired
            by the store
```

### repeated-refusals-alerted · SHOULD

Every run of failed sign-ins or refused accesses past a bound the project sets raises an alert. The alert reaches whoever answers for the system's security.

#### Why

An attack guessing passwords or probing rights shows as a run of refusals long before it succeeds, and a record nobody is told about is read only after the harm.

#### Examples

```text title="Avoid"
failed sign-ins, refused accesses
  recorded  audit records
  alert     none
```

```text title="Prefer"
failed sign-ins, refused accesses
  recorded  audit records
  alert     over 20 for one account or
            100 from one source
            within 10 minutes
  notifies  security on-call
```
