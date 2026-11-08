# Accounts

> Governs the identity analytics knows of a caller.

## Identity

### identity-reset-on-sign-out · MUST

Every sign-out resets the analytics library's identifier, so the next person on the device starts as a new visitor.

#### Why

An identifier kept across a sign-out joins two people's use into one profile.

#### Examples

```pseudo title="Avoid"
# accounts/presentation/bindings/commands/sign-out
function onSignOut({ signOut }, context)
  call signOut(context)

  return redirect("/sign-in")
```

```pseudo title="Prefer"
# accounts/presentation/bindings/commands/sign-out
function onSignOut({ signOut, analytics }, context)
  call signOut(context)
  call analytics.resetIdentity()

  return redirect("/sign-in")
```
