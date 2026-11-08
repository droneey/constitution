# Accounts

> Governs a session a forbidden read or write leaves standing.

## Ended sessions

### forbidden-failure-ends-no-session · MUST

No forbidden failure of a read or a write ends the person's session.

#### Why

A forbidden failure taken for an ended session signs the user out for the refusal of one action.

#### Examples

```pseudo title="Avoid"
# presentation/failures/on-access-failure
function onAccessFailure(failure, session)
  if failure is UnauthenticatedError or failure is ForbiddenError then
    session.end()
```

```pseudo title="Prefer"
# presentation/failures/on-access-failure
function onAccessFailure(failure, session)
  when failure
    is UnauthenticatedError then session.end()
    is ForbiddenError then showRefusal(failure)
```
