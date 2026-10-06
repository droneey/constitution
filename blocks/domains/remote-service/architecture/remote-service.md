# Remote service

> The ports and adapters that reach the other system follow core.

### responses-parsed-in-the-adapter → untrusted-input-parsed-at-edge
Every response is parsed against its wire schema in the adapter before it is mapped, so a change of the wire fails at that one boundary.

| Why | Tags |
|---|---|
| an unparsed response carries whatever the server sent into the domain, and it fails far from the cause. | [data] |

### transport-failures-mapped-once → expected-failures-typed-with-codes · MUST
One shared mapper, in `shared/<transport>/`, turns transport failures into domain errors, and nothing of the transport's library crosses the adapter: the mapper maps unauthorized and unexpected failures to shared domain errors itself and takes each feature's map of codes. It only maps, and acts on none of the errors it returns.

| Why | Tags |
|---|---|
| every adapter then fails the same way, and a feature states only what is its own. | [] |

### stream-as-async-iterable-of-domain-events → contracts-know-no-vendor-or-other-contract
A progressive result is an asynchronous sequence of domain events the port returns: its end completes it, a domain error fails it, and stopping the loop cancels it. The events are a union declared in the port's file. The adapter maps wire events and drops unknown ones. A stream a write causes is a command; a passive subscription is a query.

| Why | Tags |
|---|---|
| the domain sees its own events in its own words, and the transport can change without touching it. | [data] |

### one-transport-instance-per-system → one-explicit-composition-root
Each remote system has one configured instance of the transport — its base address, headers and credentials — which every adapter that reaches that system receives.

| Why | Tags |
|---|---|
| every adapter then speaks to the server the same way, and a test hands them all another instance. | [] |
