# Transport

> Governs where a transport is built and imported, and how its failures and another system's streams reach the program.

## General

### one-transport-instance-per-system → composition-root-assembles-the-program · MUST

Each remote system has one configured instance of the transport. The instance holds its base address, headers and credentials, and the composition root builds it and hands it to every adapter that reaches that system.

| Why |
|---|
| an adapter that builds its own instance speaks to the system its own way, with its own address and credentials, and a spec must replace each instance apart. |

## Homes

### transport-library-imported-by-its-client-and-mapper → layer-imports-dependencies-by-its-role · MUST

The transport library is imported only by the client of its system, the mapper of its failures in the top-level `shared/` and `root/`. The client of a system is the module that speaks its transport — an adapter of that system, or a client under `libs/` that knows nothing of the program and that its adapters share —, and `root/` builds the instances; no other unit imports the library.

| Why |
|---|
| the network is an effect, so each other import of the library is one more place a spec cannot replace with a fake, and one more place its failures escape the one mapper every adapter shares. |

## Failures

### transport-failures-mapped-once → shared-piece-placed-by-meaning · MUST

A transport's failures are mapped once, by one mapper its adapters share. The mapper is a module of the top-level `shared/`, named after its transport and holding no effect; it turns the transport's failures, a transient one included, into the failures of the ports its adapters implement, so nothing of the transport's library crosses an adapter.

| Why |
|---|
| a mapping repeated in each adapter drifts, so one system's failure reaches different features as different errors, and each feature restates what they all share. |

### transport-mapper-takes-each-features-codes · MUST

The transport's mapper only maps, taking each feature's codes from that feature's own map. It maps the unauthenticated, forbidden and unexpected failures to shared errors itself, and acts on none of the errors it returns.

| Why |
|---|
| a mapper that named each feature's codes itself would know every feature and change with each of them, and one that acted on an error would decide for every caller. |

## Streams

### stream-returned-as-a-sequence-of-port-events → port-knows-no-vendor · MUST

A progressive result reaches the application layer as a sequence of port events. The port returns an asynchronous sequence of events in the feature's words, which are no domain events: its end completes it, a failure fails it, and a caller that stops reading cancels it. Its events are a union declared in the port's file, to which the adapter maps the wire's events, dropping one it does not know.

| Why |
|---|
| a stream that hands the wire's events inward changes the application layer with every change of the transport, and one a caller cannot cancel by no longer reading runs on for nobody. |
