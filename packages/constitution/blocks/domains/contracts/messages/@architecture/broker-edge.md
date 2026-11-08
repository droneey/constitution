# Broker edge

> Governs where message consumers live, and how the operator reaches a held event through the dead letters of a queue only the program reads.

## Vocabulary

**`consumers/`**{#message-consumer} holds a presentation's message consumers.

## Delivery units

### consumer-lives-in-consumers → delivery-unit-beside-what-it-serves · SHOULD

Every message consumer that is no edge worker lives in the `consumers/` of the presentation whose operation it calls. It sits in a file of its own.

| Why |
|---|
| a message consumer kept apart from the work it starts changes in a second place whenever that work does, and the reader of the feature misses a way work enters it. |

### consumer-serves-one-message-type · SHOULD

Every message consumer serves one message type.

| Why |
|---|
| a message consumer of several types settles them all one way and is changed whenever any of them changes, and a reader looking for how one type is handled finds it among the others. |

## Held events

### held-event-reached-through-a-port-over-the-dead-letters → spent-step-held-for-its-operator · MUST

Every operator's command reaches an event held in a queue only the program reads through a port over that queue's dead letters.

| Why |
|---|
| a held event released by hand in the message broker's console bypasses the command that also gives up its saga step, so the step and its event part ways, and the next dead letter's operator repeats the slip. |
