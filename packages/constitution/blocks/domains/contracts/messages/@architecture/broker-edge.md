# Broker edge

> Governs where message consumers live, and how the operator reaches a held event through the dead letters of a queue only the program reads.

## Vocabulary

**`consumers/`**{#message-consumer} holds a presentation's message consumers.

## Delivery units

### consumer-lives-in-consumers → delivery-unit-beside-what-it-serves · SHOULD

Every message consumer that is no edge worker lives in the `consumers/` of the presentation whose operation it calls. It sits in a file of its own.

#### Why

A message consumer kept apart from the work it starts changes in a second place whenever that work does, and the reader of the feature misses a way work enters it.

#### Examples

```text title="Avoid"
src/features/shipping/
├── presentation/
│   └── bindings/commands/dispatch-shipment
└── infrastructure/broker/
    └── order-paid
```

```text title="Prefer"
src/features/shipping/
└── presentation/
    ├── bindings/commands/dispatch-shipment
    └── consumers/
        └── order-paid
```

### consumer-serves-one-message-type · SHOULD

Every message consumer serves one message type.

#### Why

A message consumer of several types settles them all one way and is changed whenever any of them changes, and a reader looking for how one type is handled finds it among the others.

#### Examples

```pseudo title="Avoid"
# shipping/presentation/consumers/orders
function onOrdersMessage(message, context)
  when message.type
    is "com.shop.orders.order-paid.v1" then call dispatchShipment(...)
    is "com.shop.orders.order-cancelled.v1" then call cancelShipment(...)
```

```pseudo title="Prefer"
# shipping/presentation/consumers/order-paid
function onOrderPaid(message, context)
  call dispatchShipment(parseOrderPaid(message), context)

# shipping/presentation/consumers/order-cancelled
function onOrderCancelled(message, context)
  call cancelShipment(parseOrderCancelled(message), context)
```

## Held events

### held-event-reached-through-a-port-over-the-dead-letters → spent-step-held-for-its-operator · MUST

Every operator's command reaches an event held in a queue only the program reads through a port over that queue's dead letters.

#### Why

A held event released by hand in the message broker's console bypasses the command that also gives up its saga step, so the step and its event part ways, and the next dead letter's operator repeats the slip.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/give-up-held-event
function giveUpHeldEvent(request, brokerAdmin, context)
  call brokerAdmin.purgeMessage("orders.dead-letters", request.params.eventId)
```

```pseudo title="Prefer"
# orders/application/contracts/held-events.port
type HeldEventsPort = {
  release: function(eventId: EventId, context: CallContext)
  giveUp: function(eventId: EventId, context: CallContext)
}

# orders/application/use-cases/commands/give-up-held-event.use-case
function createGiveUpHeldEvent({ heldEvents, sagaSteps })
  return function(input, context)
    call heldEvents.giveUp(input.eventId, context)
    call sagaSteps.giveUp(input.stepId, context)
```
