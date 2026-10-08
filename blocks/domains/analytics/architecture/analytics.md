# Analytics

> Governs sinks and who sends events.

## Sinks

### sinks-behind-one-contract → new-kind-added-as-a-member · MUST
Each analytics service is one sink, one `.sink` file in `sinks/`, under one contract beside the folder; the composition root chooses the active sinks and hands them to the one that sends.

| Why | Tags |
|---|---|
| a service is added or removed as one file, and nothing else knows which services exist. | [] |

### event-sent-only-by-the-delivery-layer → code-placed-by-its-reason-to-change · MUST
No domain, use case or adapter of a feature sends an event; a screen, a widget or another delivery unit translates what the user did and what the operation returned into events.

| Why | Tags |
|---|---|
| tracking is a concern of the product, not of any feature, and a feature that tracks must know the product's whole vocabulary of events. | [] |
