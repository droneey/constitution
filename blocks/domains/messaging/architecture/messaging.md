# Messaging

> Governs where publishers, consumers and jobs live, and the port before the broker.

## The broker

### publisher-is-a-port-in-the-domains-words → contract-knows-no-vendor · MUST
Code inside the edge publishes through a port that takes the feature's own events and commands, and the broker's client, its channels and its wire shape live only in the port's adapter.

| Why | Tags |
|---|---|
| the broker, its topology and its envelope change without touching the business rules, and a spec replaces the broker through the port. | [] |

## The delivery layer

### consumers-and-jobs-are-the-delivery-layer → package-laid-out-by-the-tree · SHOULD
The delivery layer of a program that consumes messages is `consumers/`, one `.consumer` file per message type it handles, and of one that runs scheduled work `jobs/`, one `.job` file per job, each beside the wiring that subscribes or schedules them.

| Why | Tags |
|---|---|
| every way work enters the program is found from one place, and a subscription is not hidden in the feature it calls. | [] |

### message-handler-stays-thin → delivery-unit-stays-thin · SHOULD
A consumer or a job parses its message or its tick, calls one operation of the feature that owns the work and returns its outcome for settlement; it holds no business rule and decides no retry.

| Why | Tags |
|---|---|
| the operation is then reached the same way from a request, a message or a spec, and the policy of settlement stays in one handler of last resort. | [] |
