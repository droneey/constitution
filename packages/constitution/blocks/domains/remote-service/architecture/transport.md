# Transport

> Governs where a transport is built and imported, and how its failures and another system's streams reach the application.

## General

### one-transport-instance-per-system → composition-root-wires-everything · MUST

Each remote system has one configured instance of the transport — its base address, headers and credentials — which the composition root builds and hands to every adapter that reaches that system.

| Why |
|---|
| every adapter then speaks to the system the same way, and a test hands them all another instance. |

## Homes

### transport-library-home-is-the-infrastructure → layer-imports-dependencies-by-its-role · MUST

The library that speaks a remote system's transport has its home in the infrastructure, in the client of a system under `libs/`, in the mapper of its failures under `shared/` and in `root/`, which builds its instances: no other folder imports it.

| Why |
|---|
| the network is an effect, and the code that reaches it is the code a spec replaces with a fake; the mapper turns the library's failures into the program's own in one place every adapter shares. |

## Failures

### transport-failures-mapped-once → adapter-maps-its-dependencys-failures · MUST

One shared mapper per transport, in the infrastructure's `shared/<transport>/`, turns the transport's failures, a transient one included, into the failures of the ports its adapters implement, so nothing of the transport's library crosses an adapter.

| Why |
|---|
| every adapter then fails the same way, and a feature states only what is its own. |

### transport-mapper-takes-each-features-codes · SHOULD

The transport's mapper maps the unauthenticated, forbidden and unexpected failures to shared errors itself, takes each feature's map of its own codes, and acts on none of the errors it returns.

| Why |
|---|
| a feature's codes are its own, so only the feature can name them, and a mapper that acted on an error would decide for every caller. |

## Streams

### stream-returned-as-a-sequence-of-port-events → contract-knows-no-vendor · MUST

A progressive result reaches the application as an asynchronous sequence the port returns, of events in the feature's words, which are no domain events: its end completes it, a failure fails it, and a caller that stops reading cancels it. Its events are a union declared in the port's file, to which the adapter maps the wire's events, dropping one it does not know.

| Why |
|---|
| the application sees the system's events in its own words, and the transport can change without touching it. |
