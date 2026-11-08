# Feature flags

> Governs a feature flag's end: the condition it declares for its removal and its retirement.

## Vocabulary

A **feature flag** is a setting that switches a behaviour on or off where the program runs.

## General

### feature-flag-retired-once-settled · SHOULD

Every feature flag is retired once it is settled. Once it serves one value everywhere, it is removed with the branch it no longer takes.

#### Why

A flag that serves one value everywhere is a branch that never runs, and it hides from every tool because it is still read.

#### Examples

```pseudo title="Avoid"
# oneStepCheckout: on everywhere since May
if flags.oneStepCheckout then
  checkOutInOneStep(cart)
else
  checkOutInThreeSteps(cart)
```

```pseudo title="Prefer"
checkOutInOneStep(cart)
```

### feature-flag-declares-its-removal-condition · SHOULD

Every feature flag's declaration records the condition for its removal.

#### Why

A flag whose end nobody wrote down is never known to have settled, so it stays, and the branches it guards are kept alive with it.

#### Examples

```pseudo title="Avoid"
# infrastructure/config
let Flags = {
  oneStepCheckout: flag({ default: false })
}
```

```pseudo title="Prefer"
# infrastructure/config
let Flags = {
  oneStepCheckout: flag({
    default: false,
    removeWhen: "on in every market for 30 days with no rise in failed payments"
  })
}
```
