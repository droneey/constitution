# Streams

> Governs how another system's stream reaches the application layer, where it is folded and when it is cancelled.

## General

### stream-returned-as-a-sequence-of-port-events → port-knows-no-vendor · MUST

Every remote system's stream of events reaches the application layer as an asynchronous sequence of port events in the feature's words. The events are no domain events but a union to which the adapter maps the wire's events, and the sequence completes at its end and fails at a failure.

| Why |
|---|
| a stream that hands the wire's events inward changes the application layer with every change of the remote transport. |

### stream-folded-in-the-domain → business-rule-lives-in-the-domain · MUST

Every stream of events that builds an entity is folded by a pure function of the domain model. It is never folded in the remote transport, nor in a cache that holds what the stream delivers.

| Why |
|---|
| a fold written into the remote transport or a cache is proven only over a network, and changes with every change of the remote transport. |

### stream-cancelled-when-its-caller-stops-reading → outside-call-can-be-cancelled · MUST

Every sequence of port events is cancelled, with the call that feeds it, once its caller stops reading it.

| Why |
|---|
| a stream its caller cannot cancel by no longer reading runs on for nobody, holding its connection and spending the other side's quota. |
