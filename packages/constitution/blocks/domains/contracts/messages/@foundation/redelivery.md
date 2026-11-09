# Redelivery

> Governs a message whose handling fails: its settlement, its retries and its dead letters, and the specs that redeliver and reorder messages.

## Settlement

### refused-message-acknowledged-as-handled → last-resort-handler-one-per-interface · MUST

Every message refused by a rule of the business is acknowledged as handled by its message consumer's handler of last resort. Exempt: a message that hands the program's own event to what reacts to it within the program.

#### Why

A refusal dead-lettered pages someone for an outcome of the business, and one released is refused again on every delivery.

#### Examples

```pseudo title="Avoid"
# presentation/bindings/settle-message
function settleMessage(message, error, context)
  if isBusinessRefusal(error) then
    return message.deadLetter(error)
  ...
```

```pseudo title="Prefer"
# presentation/bindings/settle-message
function settleMessage(message, error, context)
  if isBusinessRefusal(error) then
    call outcomes.publish(messageRefused(message.id, error.code), context)
    return message.ack()
  ...
```

### refused-message-outcome-recorded → last-resort-handler-one-per-interface · MUST

Every message a rule of the business refuses has its refusal recorded or published by its message consumer's handler of last resort. Exempt: a message that hands the program's own event to what reacts to it within the program.

#### Why

A refusal acknowledged with no trace of it leaves its publisher waiting for an effect that never comes, and nobody able to learn why.

#### Examples

```pseudo title="Avoid"
# presentation/bindings/settle-message
function settleMessage(message, error, context)
  if isBusinessRefusal(error) then
    return message.ack()
  ...
```

```pseudo title="Prefer"
# presentation/bindings/settle-message
function settleMessage(message, error, context)
  if isBusinessRefusal(error) then
    call outcomes.publish(messageRefused(message.id, error.code), context)
    return message.ack()
  ...
```

### failed-message-settled-by-its-failure → last-resort-handler-one-per-interface · MUST

Every message whose handling can never succeed goes to its dead letters at once, by its message consumer's handler of last resort. Such a message fails its parse, has a type or a version its message consumer does not know, or met a defect in its handling.

#### Why

A poison message retried returns for ever and blocks those behind it.

#### Examples

```pseudo title="Avoid"
# presentation/bindings/settle-message
function settleMessage(message, error, context)
  if error is MessageParseError or error is UnknownMessageTypeError then
    return message.release(after: jitteredBackoff(message.deliveryCount))
  ...
```

```pseudo title="Prefer"
# presentation/bindings/settle-message
function settleMessage(message, error, context)
  if error is MessageParseError or error is UnknownMessageTypeError then
    return message.deadLetter(error)
  if isDefect(error) then
    return message.deadLetter(error)
  ...
```

### transient-failure-releases-its-message → last-resort-handler-one-per-interface · MUST

Every message whose handling failed transiently is released for a later delivery by its message consumer's handler of last resort. A message that names what has not arrived yet failed transiently.

#### Why

Across ordering keys a message often arrives before the one that creates what it names, so a dead letter for it loses work that a later delivery would have done.

#### Examples

```pseudo title="Avoid"
# presentation/bindings/settle-message
function settleMessage(message, error, context)
  if error is OrderNotYetKnownError then
    return message.deadLetter(error)
  ...
```

```pseudo title="Prefer"
# presentation/bindings/settle-message
function settleMessage(message, error, context)
  if error is OrderNotYetKnownError or isTransient(error) then
    return message.release(after: jitteredBackoff(message.deliveryCount))
  ...
```

## Retries

### redelivery-waits-a-growing-delay → retry-waits-by-backoff-or-the-asked-delay · MUST

Every message released after a transient failure waits a growing, randomly spread delay before its next delivery. The delay is set on the message broker or the message consumer, never left at the message broker's default of redelivering at once.

#### Why

A message broker often redelivers a released message at once, into the same outage, so every message consumer's retries land on the system that is down together.

#### Examples

```pseudo title="Avoid"
if isTransient(error) then
  return message.release()
```

```pseudo title="Prefer"
if isTransient(error) then
  return message.release(after: jitteredBackoff(message.deliveryCount))
```

### redelivery-limited-then-dead-lettered → failure-retried-only-when-transient · MUST

Every released message goes to its dead letters once delivered as often as the project's limit allows. The message broker counts the deliveries, and whatever takes the message reads its count there, keeping no count of its own.

#### Why

A message retried without a limit never leaves the queue, and a count the message consumer keeps on top of the message broker's multiplies the attempts the project meant to allow.

#### Examples

```pseudo title="Avoid"
if isTransient(error) then
  let attempts = retryCounts.increment(message.id)
  if attempts > maxDeliveries then
    return message.deadLetter(error)

  return message.release(after: jitteredBackoff(attempts))
```

```pseudo title="Prefer"
if isTransient(error) then
  if message.deliveryCount >= maxDeliveries then
    return message.deadLetter(error)

  return message.release(after: jitteredBackoff(message.deliveryCount))
```

## Dead letters

### dead-letter-keeps-what-a-replay-needs · MUST

Every dead letter keeps its message whole, with the cause of its last failure. That is the message's body, its headers and its count of attempts, and the code and the cause of the failure.

#### Why

A dead letter without its cause cannot be diagnosed, and one without its body or headers cannot be replayed.

#### Examples

```pseudo title="Avoid"
call deadLetters.add({
  messageId: message.id,
  error: error.message,
})
```

```pseudo title="Prefer"
call deadLetters.add({
  body: message.body,
  headers: message.headers,
  deliveryCount: message.deliveryCount,
  failure: { code: error.code, cause: describeCause(error) },
})
```

### dead-letter-leaves-only-by-its-operators-command · MUST

Every dead letter leaves its dead letters only by its operator's command. The command hands it on again once the fault is fixed, or gives it up. Exempt: a dead letter of another program's message whose data a retention the project sets forbids keeping longer, which leaves as abandoned once that retention ends.

#### Why

A dead letter sent back automatically fails again for the same reason, and one dropped by a purge or by the message broker's default retention loses work nobody decided to give up.

#### Examples

```pseudo title="Avoid"
every hour
  for deadLetter in deadLetters.all()
    call broker.republish(deadLetter.message)
```

```pseudo title="Prefer"
function replayDeadLetter(command, context)
  call requireOperator(context)
  let deadLetter = deadLetters.take(command.deadLetterId, context)

  call broker.republish(deadLetter.message, context)

function giveUpDeadLetter(command, context)
  call requireOperator(context)
  call deadLetters.giveUp(command.deadLetterId, command.reason, context)
```

### abandoned-dead-letter-reported-to-its-operator · MUST

Every dead letter of another program's message that leaves once its data's retention ends is reported to its operator as abandoned.

#### Why

A dead letter that leaves unreported is work abandoned with nobody aware, so its operator learns of it only from the effect that never came.

#### Examples

```pseudo title="Avoid"
every day
  call deadLetters.deleteOlderThan(partnerDataRetention)
```

```pseudo title="Prefer"
every day
  for deadLetter in deadLetters.olderThan(partnerDataRetention)
    call deadLetters.abandon(deadLetter.id)
    call operatorAlerts.send(abandonedDeadLetter({
      messageId: deadLetter.messageId,
      type: deadLetter.type,
      failure: deadLetter.failure.code,
    }))
```

### key-parked-while-its-message-is-dead-lettered · MUST

Where their order matters to its message consumer, each later message of a key is parked behind its key's dead letter. Exempt: a message that hands the program's own event to what reacts to it within the program.

#### Why

A later change applied on top of one that never took effect leaves the object in a state no sequence of its changes produces.

#### Examples

```pseudo title="Avoid"
function onStockChanged(message, context)
  call stockLevels.apply(parseStockChanged(message), context)
```

```pseudo title="Prefer"
function onStockChanged(message, context)
  let earlier = deadLetters.firstOfKey(message.orderingKey)

  if earlier is not <absent> then
    return message.deadLetter(parkedBehind(earlier.messageId))

  call stockLevels.apply(parseStockChanged(message), context)
```

### only-its-keys-messages-parked-behind-a-dead-letter · MUST

Where later messages are parked behind it, every dead letter holds back only those of its own ordering key, never another key's.

#### Why

A dead letter that stops its whole partition or queue holds every other object's changes for as long as its operator takes, though none of them depends on the one that failed.

#### Examples

```pseudo title="Avoid"
function onStockChanged(message, context)
  let earlier = deadLetters.first()

  if earlier is not <absent> then
    return message.deadLetter(parkedBehind(earlier.messageId))

  call stockLevels.apply(parseStockChanged(message), context)
```

```pseudo title="Prefer"
function onStockChanged(message, context)
  let earlier = deadLetters.firstOfKey(message.orderingKey)

  if earlier is not <absent> then
    return message.deadLetter(parkedBehind(earlier.messageId))

  call stockLevels.apply(parseStockChanged(message), context)
```

### parked-messages-handed-on-after-their-dead-letter · MUST

Every message parked behind a dead letter is handed on in its key's order. It goes only after that dead letter is handed on again, and after the messages parked before it; where the command gives the dead letter up, those parked behind it wait for a command of their own.

#### Why

A parked message handed on before the one it waits behind applies a later change on top of one that never took effect, the state its parking kept out.

#### Examples

```pseudo title="Avoid"
function replayDeadLetter(command, context)
  call requireOperator(context)
  let deadLetter = deadLetters.take(command.deadLetterId, context)

  for parked in deadLetters.takeParkedBehind(deadLetter.messageId, context)
    call broker.republish(parked.message, context)

  call broker.republish(deadLetter.message, context)
```

```pseudo title="Prefer"
function replayDeadLetter(command, context)
  call requireOperator(context)
  let deadLetter = deadLetters.take(command.deadLetterId, context)

  call broker.republish(deadLetter.message, context)

  for parked in deadLetters.takeParkedBehind(deadLetter.messageId, context)
    call broker.republish(parked.message, context)
```

## Specs

### redelivery-has-a-case → edge-cases-chosen-by-risk · SHOULD

Every message consumer's specs deliver one message twice and check that its effect happened once.

#### Why

Redelivery is rare on a developer's machine and certain in production, so only a case exercises it before a customer is charged twice.

#### Examples

```text title="Avoid"
on-order-paid.test
  should add points when the order is paid
  should refuse the message when its customer is unknown
```

```text title="Prefer"
on-order-paid.test
  should add points when the order is paid
  should refuse the message when its customer is unknown
  should add points once when the message is delivered twice
```

### reordering-has-a-case → edge-cases-chosen-by-risk · SHOULD

Every message consumer to which order matters has a case that delivers two messages of one ordering key out of order.

#### Why

Reordering is rare on a developer's machine and certain under competing message consumers, so only a case shows what the message consumer does with an older state that arrives last.

#### Examples

```text title="Avoid"
on-stock-changed.test
  should set the stock level of a product
  should set the level once when a change is delivered twice
```

```text title="Prefer"
on-stock-changed.test
  should set the stock level of a product
  should set the level once when a change is delivered twice
  should keep the newer level when the older change arrives last
```
