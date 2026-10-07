# Analytics with access control

> Governs the identity analytics knows of a caller.

## Identity

### identity-reset-on-sign-out · MUST
Signing out resets the analytics library's identifier, so the next person on the device starts as a new visitor.

| Why | Tags |
|---|---|
| an identifier kept across a sign-out joins two people's use into one profile. | [data, security] |
