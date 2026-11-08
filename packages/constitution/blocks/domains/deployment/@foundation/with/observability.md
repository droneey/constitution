# Observability

> Governs what the program logs of its configuration while it is observed.

## General

### refused-configuration-reported → failure-logged-once · MUST

Every changed configuration set the program refuses is logged where it is refused, or reported there to the unit that logs it.

| Why |
|---|
| a refusal nobody hears of leaves the operator sure the change took, while the program goes on running the set they meant to replace. |
