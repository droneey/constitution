# Sinks

> Governs who sends an event and the sinks it is sent through.

## General

### event-sent-only-by-binding-units → code-placed-by-its-reason-to-change · MUST

Only a binding unit sends an analytics event. No unit of a feature's domain, application or infrastructure sends one, nor a delivery unit that is no binding unit; the binding unit translates what the user did and what its operation returned into events.

| Why |
|---|
| a feature that tracks must know the product's whole vocabulary of events, a concern of the product rather than of any feature, and changes whenever that vocabulary does; a unit that renders and sends as well must be handed the port the events go through, and can no longer be shown or tested with plain data. |

### sinks-behind-one-port → new-kind-added-as-a-member · MUST

Every analytics service is a sink behind one port. Each sink is an adapter of that port, and the composition root chooses the active sinks and hands them to the binding units that send.

| Why |
|---|
| a service wired into the code that sends is added or removed by edits across it, and each such edit can break the services already there — the open–closed principle. |
