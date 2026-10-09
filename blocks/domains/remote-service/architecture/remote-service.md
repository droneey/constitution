# Remote service

> Governs where a transport is built and its failures mapped.

## Failures

### transport-failures-mapped-once → catch-handles-only-what-it-recognises · MUST
One shared mapper per transport, in `shared/<transport>/`, turns the transport's failures into the program's errors, so nothing of the transport's library crosses an adapter.

| Why | Tags |
|---|---|
| every adapter then fails the same way, and a feature states only what is its own. | [errors] |

### transport-mapper-takes-each-features-codes · SHOULD
The transport's mapper maps the unauthenticated, forbidden and unexpected failures to shared errors itself, takes each feature's map of its own codes, and acts on none of the errors it returns.

| Why | Tags |
|---|---|
| a feature's codes are its own, so only the feature can name them, and a mapper that acted on an error would decide for every caller. | [] |

## Streams

### stream-returned-as-a-sequence-of-domain-events → contract-knows-no-vendor · MUST
A progressive result reaches the domain as an asynchronous sequence of domain events the port returns: its end completes it, a failure fails it, and a caller that stops reading cancels it. Its events are a union declared in the port's file, to which the adapter maps the wire's events, dropping one it does not know.

| Why | Tags |
|---|---|
| the domain sees its own events in its own words, and the transport can change without touching it. | [data] |

## Wiring

### one-transport-instance-per-system → composition-root-wires-everything · MUST
Each remote system has one configured instance of the transport — its base address, headers and credentials — which the composition root builds and hands to every adapter that reaches that system.

| Why | Tags |
|---|---|
| every adapter then speaks to the system the same way, and a test hands them all another instance. | [] |
