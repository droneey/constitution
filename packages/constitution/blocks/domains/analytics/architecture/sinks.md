# Sinks

> Governs who sends an event and the sinks it is sent through.

## General

### event-sent-only-by-delivery-units → code-placed-by-its-reason-to-change · MUST

No feature's domain, application or infrastructure sends an event; its presentation — a screen, a widget or another delivery unit — translates what the user did and what the operation returned into events.

| Why |
|---|
| tracking is a concern of the product, not of any feature, and a feature that tracks must know the product's whole vocabulary of events. |

### sinks-behind-one-contract → new-kind-added-as-a-member · MUST

Each analytics service is one sink, an adapter of the infrastructure — one **`.sink`**{#analytics-sink-file} file in **`sinks/`**{#analytics-sink} — implementing one contract in the application's contracts; the composition root chooses the active sinks and hands them to the one that sends.

| Why |
|---|
| a service is added or removed as one file, and nothing else knows which services exist. |
