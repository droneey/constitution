# Analytics

> **Vocabulary:** folder `sinks`, suffix `.sink`.

## sinks-behind-one-contract → set-folder-holds-only-members
Each analytics service is one sink, one `.sink` file in `sinks/`, under one contract beside the folder; a registry chooses the active sinks.

| Why | Check | Tags |
|---|---|---|
| a service is added or removed as one file, and nothing else knows which services exist. | tool/names | [] |

## features-never-track → features-blind-to-each-other
A feature never sends an event; the composing layer translates the feature's intents and outcomes into events.

| Why | Check | Tags |
|---|---|---|
| tracking is a concern of the product, not of any feature, and a feature that tracks knows the vocabulary of all of them. | tool/architecture | [] |
