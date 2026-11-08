# Processes

> Governs a business process that spans several programs or transactions.

## General

### multi-step-process-compensated · MUST

Every business process spanning several programs or transactions is unwound once one of its steps is refused or abandoned. It runs a compensating step, one that undoes what a step wrote, for each earlier step that may have taken effect and that the business does not yet count as done.

#### Why

No transaction spans programs, so a process that fails midway is either undone step by step or left half done, while a step undone on a failure a retry may still clear, or after the business counts it as done, takes back what should have stood — the compensating transaction pattern.

#### Examples

```pseudo title="Avoid"
# checkout/application/use-cases/commands/check-out.use-case
function createCheckOut({ inventory, payments })
  return function(input, context)
    let reservation = await inventory.reserve(input.lines, { key: input.reservationKey }, context)

    await payments.charge(input.totalCents, { key: input.paymentKey }, context)  # a refusal leaves the stock reserved
```

```pseudo title="Prefer"
# checkout/application/use-cases/commands/check-out.use-case
function createCheckOut({ inventory, payments })
  return function(input, context)
    let reservation = await inventory.reserve(input.lines, { key: input.reservationKey }, context)

    try
      await payments.charge(input.totalCents, { key: input.paymentKey }, context)
    catch PaymentRefusedError as refusal
      await inventory.release(reservation.id, context)
      throw refusal
```

### multi-step-process-state-kept-in-a-store · MUST

Every business process that spans several programs or transactions keeps its state in a store, never in memory alone. Exempt: a process its caller runs again from its first step after a stop, every step of it idempotent.

#### Why

A process whose state lives only in memory is lost with the program that held it, with no record of which steps took effect or how to undo them — the compensating transaction pattern.

#### Examples

```pseudo title="Avoid"
# checkout/application/use-cases/commands/check-out.use-case
function createCheckOut({ inventory, payments })
  return function(input, context)
    let checkout = startCheckout(input)  # a stop loses which steps took effect

    let reservation = await inventory.reserve(checkout.lines, { key: checkout.reservationKey }, context)
    checkout = markReserved(checkout, reservation.id)

    await payments.charge(checkout.totalCents, { key: checkout.paymentKey }, context)
```

```pseudo title="Prefer"
# checkout/application/use-cases/commands/check-out.use-case
function createCheckOut({ checkoutRepository, inventory, payments })
  return function(input, context)
    let started = startCheckout(input)
    await checkoutRepository.save(started.checkout, [started.event], context)

    let reservation = await inventory.reserve(started.checkout.lines, { key: started.checkout.reservationKey }, context)
    let reserved = markReserved(started.checkout, reservation.id)
    await checkoutRepository.save(reserved.checkout, [reserved.event], context)

    await payments.charge(reserved.checkout.totalCents, { key: reserved.checkout.paymentKey }, context)
```
