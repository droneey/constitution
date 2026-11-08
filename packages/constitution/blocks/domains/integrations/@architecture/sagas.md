# Sagas

> Governs a saga's calls that reach another system: how long a retry under the step's identifiers stays safe and how the saga learns it, how a call the system decides later is recorded and how its outcome reaches the saga, and how a compensation stops a call still in flight.

## Vocabulary

A saga's step or compensation has a **step key** when its call reaches a remote system under an idempotency key; its **key retention** is how long that system keeps the key.

A step's or a compensation's outcome is **in doubt** while a call of it that had no answer may have taken effect: for a step, while its outcome is unknown; for a compensation, from a call of it that had no answer until a later call of it lands or is refused.

A saga's call is **deferred** when the port through which its participant reaches a remote system declares that the system may decide a call's outcome later, and the call's answer says it does, as for a charge awaiting the cardholder's check or a booking a webhook confirms. A deferred call that raises no failure is only accepted and has not landed: its **outcome notice**, the system's message of its own that gives the outcome or the answer of a read of that system that shows it, is its answer, and a call whose outcome notice has not come within the time that port declares, counted from when the call was made, is a call that had no answer.

## Retries

### step-key-retention-declared-by-its-port · MUST

Every port through which a saga's call reaches a remote system under a step key declares its key retention.

#### Why

A retry under the step's key is safe only while its remote system still knows the key, and a saga that cannot see that time cannot keep its retries within it.

#### Examples

```pseudo title="Avoid"
# payments/application/contracts/payment-provider.port
type PaymentProviderPort = {
  charge: function(ChargeRequest, { key: IdempotencyKey }, CallContext): ChargeAnswer
    fails with PaymentRefusedError, PaymentProviderUnavailableError,
      UnauthenticatedError, ForbiddenError
}
```

```pseudo title="Prefer"
# payments/application/contracts/payment-provider.port
type PaymentProviderPort = {
  charge: function(ChargeRequest, { key: IdempotencyKey }, CallContext): ChargeAnswer
    fails with PaymentRefusedError, PaymentProviderUnavailableError,
      UnauthenticatedError, ForbiddenError
}

let chargeKeyRetention: Duration = hours(24)
```

### port-declared-step-times-offered-through-its-surface → fact-has-one-source · MUST

Every key retention and every time for an outcome notice that a participant's port declares reaches the saga through its feature's surface. The composition module keeps no copy of either.

#### Why

A time copied into the composition module stays when the port's changes, so the saga retries under a key its remote system no longer keeps, or takes for overdue a notice the system is still within its time to give — a single source of truth.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/fail-charge-attempt.use-case
let chargeKeyRetention = hours(24)  # a copy of the payments port's
```

```pseudo title="Prefer"
# payments/application/contracts/payment-provider.port
let chargeKeyRetention: Duration = hours(24)
let chargeNoticeTime: Duration = minutes(30)

# composition/checkout/application/use-cases/commands/fail-charge-attempt.use-case
import { chargeKeyRetention } from "features/payments"
```

### step-retried-only-while-its-key-is-kept → failure-retried-only-when-transient · MUST

Every retry limit of a step or compensation whose outcome is in doubt ends with its key retention. Once that retention, as its port declares it, has passed since the step or compensation was first made due, neither the saga's schedule nor its reactions make an attempt of it due, and it is spent.

#### Why

A retry under a key its remote system no longer keeps is taken as a new call, so a charge or a booking whose lost answer had landed is made a second time — the idempotent receiver.

#### Examples

```pseudo title="Avoid"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function failChargeAttempt(saga, now, limits)
  if saga.charge.attempts >= limits.maxAttempts then
    return spendCharge(saga)

  return makeChargeDue(saga, now + backoff(saga.charge.attempts))  # may fall past the key's retention
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function failChargeAttempt(saga, now, limits)
  let nextAt = now + backoff(saga.charge.attempts)

  if saga.charge.attempts >= limits.maxAttempts then
    return spendCharge(saga)

  if nextAt - saga.charge.firstDueAt >= limits.chargeKeyRetention then
    return spendCharge(saga)

  return makeChargeDue(saga, nextAt)
```

### revived-step-calls-only-while-its-key-is-kept → failure-retried-only-when-transient · MUST

Every operator's revival of a step or compensation whose outcome is in doubt is refused once its key retention has passed. That retention is the one its port declares, counted from when the step or compensation was first made due.

#### Why

A revival makes the call due again under the same key, so past that retention it charges or books a second time whenever the lost answer had landed, and the operator can only give the step up, against the remote system's own records.

#### Examples

```pseudo title="Avoid"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function reviveCharge(saga, now, limits)
  return makeChargeDue(saga, now)
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function reviveCharge(saga, now, limits)
  if now - saga.charge.firstDueAt >= limits.chargeKeyRetention then
    throw new ChargeKeyExpiredError(saga.id)

  return makeChargeDue(saga, now)
```

## Deferred calls

### deferred-outcome-taken-by-its-participants-feature → later-outcome-recorded-by-a-composition-command · MUST

Every outcome notice of a deferred call is taken by a delivery unit of its participant's feature, never by the composition module. That unit, such as the handler of the remote system's webhook or a scheduled job that reads that system, matches the notice's identifiers to the call's and calls a command of the feature that records the outcome.

#### Why

A composition module that takes the notice itself leaves the participant's feature holding its call as accepted for ever, so the feature's compensation decides on a stale record, and parses the remote system's messages apart from the adapter that holds the rest of that system's model — an anti-corruption layer.

#### Examples

```text title="Avoid"
composition/checkout/presentation/bindings/commands/
└── on-provider-webhook   takes the charge's outcome
                          and records it in the saga
```

```text title="Prefer"
features/payments/presentation/bindings/commands/
└── on-provider-webhook   calls record-charge-outcome
composition/checkout/presentation/bindings/commands/
└── on-charge-settled     reacts to payments' ChargeSettled
```

### deferred-outcome-reaches-the-saga-by-the-features-event → later-outcome-recorded-by-a-composition-command · MUST

Every outcome of a deferred call that its participant's feature records reaches the saga only by that feature's event. The command that records it yields the event, and the saga's reaction to that event records the outcome in the saga's aggregate by a transition. Exempt: a saga a durable-execution engine runs, which keeps its state and its compensations itself.

#### Why

An outcome the saga learns otherwise, by a composition command that reads the feature's record or by a call the feature makes into the saga, either ties the feature to the saga or leaves the two records apart whenever one of their writes fails — the saga pattern.

#### Examples

```pseudo title="Avoid"
# payments/application/use-cases/commands/record-charge-outcome.use-case
function createRecordChargeOutcome({ chargeRepository, checkoutSaga })
  return function(input, context)
    let charge = await chargeRepository.find(input.chargeId, context)
    let settled = settle(charge, input.outcome)

    await chargeRepository.save(settled.charge, [settled.event], context)
    await checkoutSaga.recordChargeOutcome(input, context)  # the feature calls into the saga
```

```pseudo title="Prefer"
# payments/application/use-cases/commands/record-charge-outcome.use-case
function createRecordChargeOutcome({ chargeRepository })
  return function(input, context)
    let charge = await chargeRepository.find(input.chargeId, context)
    let settled = settle(charge, input.outcome)

    await chargeRepository.save(settled.charge, [settled.event], context)

# composition/checkout/presentation/bindings/commands/on-charge-settled
function onChargeSettled(event: ChargeSettled, recordCheckoutCharge, context)
  call recordCheckoutCharge(parseRecordCheckoutChargeInput(event), context)
```

### deferred-call-acceptance-recorded-with-its-notice-time → saga-state-held-by-an-aggregate-of-its-module · MUST

Every deferred call's acceptance is recorded, with the time its outcome notice is due, by the reaction that made the call. It records both by a transition of the saga's aggregate, the due time being the time its port declares, counted from when the call was made. Exempt: a saga a durable-execution engine runs, which keeps its state and its compensations itself.

#### Why

An overdue notice is found by the time the saga's aggregate holds for it, so an acceptance recorded without that time, or a time each pass of the schedule works out for itself, leaves the overdue call unrecorded, or recorded at another time on each pass — the saga pattern.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/charge-order.use-case
    let answer = await chargeOrder(saga.chargeRequest, context)

    if answer is Accepted then
      let accepted = acceptCharge(saga)  # no time the notice is due by
      await checkoutSagaRepository.save(accepted.saga, [accepted.event], context)
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/charge-order.use-case
    let calledAt = clock.now()
    let answer = await chargeOrder(saga.chargeRequest, context)

    if answer is Accepted then
      let accepted = acceptCharge(saga, calledAt + chargeNoticeTime)
      await checkoutSagaRepository.save(accepted.saga, [accepted.event], context)
```

### deferred-outcome-answers-the-latest-call-made-due → later-outcome-recorded-by-a-composition-command · MUST

Every deferred call's outcome notice is the outcome of its step's or compensation's latest call made due, whatever attempt it answers.

#### Why

Every attempt runs under the step's identifiers, so a notice that comes after its call was taken for unanswered matches the retry as well, and a saga that reads it as the first call's discards a landing as late and retries until the step is spent, though the remote system answered.

#### Examples

```pseudo title="Avoid"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordChargeOutcome(saga, outcome)
  if outcome.attempt != saga.charge.attempts then
    return discardAsLate(saga, outcome)  # the retry's own landing thrown away

  return settleCharge(saga, outcome)
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordChargeOutcome(saga, outcome)
  if saga.charge is settled then
    return discardAsLate(saga, outcome)

  return settleCharge(saga, outcome)
```

### overdue-deferred-call-recorded-by-the-schedule → saga-resumed-by-a-schedule · MUST

Every deferred call whose outcome notice is overdue is recorded as a failed attempt by its saga's schedule. While the call is unsettled, a scheduled delivery unit of the composition module calls, at the time the saga's aggregate holds for that notice, the command that records it by a transition, marks its outcome unknown and, where it spends nothing, makes the next attempt due at once, the time waited for the notice being that attempt's delay. Exempt: a saga a durable-execution engine runs, which keeps its state and its compensations itself.

#### Why

A deferred call whose notice never comes leaves its step pending with no answer to wake it, and a next attempt made due later than the record leaves a gap in which a notice that does come answers a call already settled and is discarded as late, while the wait for the notice is the delay its remote system asked for, so the retry adds none.

#### Examples

```pseudo title="Avoid"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function markChargeOverdue(saga, now)
  return makeChargeDue(markChargeUnknown(saga), now + backoff(saga.charge.attempts))  # a gap a late notice falls into
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function markChargeOverdue(saga, now)
  return makeChargeDue(markChargeUnknown(saga), now)

# composition/checkout/presentation/jobs/record-overdue-charges
schedule("record-overdue-charges", { every: minutes(1), missed: skip, overlapping: skip },
  function(tick, context)
    call recordOverdueCharges({ now: tick }, context))
```

## Compensations

### compensation-cancels-a-call-still-in-flight · MUST

Where its remote system can cancel a call in flight by key, every compensation of a step of unknown outcome does so. It cancels the call under the step's identifiers, so the call cannot land after the compensation.

#### Why

A compensation that finds nothing to undo while the call is still in flight lands, and the call then lands after it, leaving a charge or a booking for an order the saga already rewound.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/undo-charge.use-case
    let charge = await findCharge({ key: saga.chargeKey }, context)

    if charge is <absent> then
      return  # the charge still in flight lands after this

    await refundCharge({ chargeId: charge.id, key: saga.refundKey }, context)
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/undo-charge.use-case
    let cancelled = await cancelCharge({ key: saga.chargeKey }, context)

    if cancelled is AlreadyLanded then
      await refundCharge({ chargeId: cancelled.chargeId, key: saga.refundKey }, context)
```
