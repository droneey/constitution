# Broker edge

> Governs where consumers and jobs live and what they hold, and the port before the broker.

## Delivery units

### consumers-and-jobs-beside-the-work-they-run → delivery-unit-beside-what-it-serves · MUST

Consumers and jobs live beside the work they run, each kind in a folder of its own. A consumer, one `.consumer` file per message type, lives in **`consumers/`**{#message-consumer} of its presentation, and a job, one `.job` file per job, in **`jobs/`**{#background-job}.

| Why |
|---|
| a consumer or a job kept apart from the work it starts changes in a second place whenever that work does, and the reader of the feature misses a way work enters it. |

### consumer-and-job-stay-thin → delivery-unit-stays-thin · MUST

A consumer or a job stays thin. It parses its message or its tick, calls one operation of the feature or the composition module that owns the work and returns its outcome for settlement; it holds no business rule and decides no retry.

| Why |
|---|
| a business rule in a consumer or a job is reached only through the broker, so a request or a spec that calls the operation skips it, and a retry decided there splits the policy of settlement away from the one handler of last resort. |

## The broker

### publisher-is-a-port-in-the-domains-words → port-knows-no-vendor · MUST

The broker is reached through a port in the domain's words. The port takes the feature's domain events and its command messages; the broker's client, its channels and the integration events it maps them to live only in the port's adapter.

| Why |
|---|
| code that speaks the broker's client or envelope changes with every change of the broker or its topology, and its spec can replace the broker only by patching the client — ports and adapters. |
