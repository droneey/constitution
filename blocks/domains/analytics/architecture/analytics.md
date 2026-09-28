# Analytics

## sinks-behind-one-contract · SHOULD
Each analytics service is one sink, one `.sink` file in `sinks/`, under one contract beside the folder; a registry chooses the active sinks.
**Why:** a service is added or removed as one file, and nothing else knows which services exist.
**Check:** tool — names
**Implements:** `set-folder-holds-only-members`

## features-never-track · MUST
A feature never sends an event; the composing layer translates the feature's intents and outcomes into events.
**Why:** tracking is a concern of the product, not of any feature, and a feature that tracks knows the vocabulary of all of them.
**Check:** tool — architecture
**Implements:** `features-blind-to-each-other`
