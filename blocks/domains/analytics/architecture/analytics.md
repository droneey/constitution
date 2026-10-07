# Analytics

> **Vocabulary:** folder `sinks`, suffix `.sink`.

### sinks-behind-one-contract → new-kind-added-as-a-member · MUST
Each analytics service is one sink, one `.sink` file in `sinks/`, under one contract beside the folder; a registry chooses the active sinks.

| Why | Tags |
|---|---|
| a service is added or removed as one file, and nothing else knows which services exist. | [] |

### sinks-folder-holds-sink-files → set-folder-holds-only-members · SHOULD
`sinks/` holds only `.sink` files, a surface and `__tests__/`.

| Why | Tags |
|---|---|
| a service is then one file of one form. | [] |

### features-never-track → code-placed-by-its-reason-to-change · MUST
A feature never sends an event; the composing layer translates the feature's intents and outcomes into events.

| Why | Tags |
|---|---|
| tracking is a concern of the product, not of any feature, and a feature that tracks knows the vocabulary of all of them. | [] |
