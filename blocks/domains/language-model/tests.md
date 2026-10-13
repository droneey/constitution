# Tests

> Governs the specs of the code around a model call.

## Models

### spec-replaces-the-model → test-runs-in-a-sandbox · MUST
A spec replaces the model with scripted or recorded answers, and an eval that calls a real model runs apart, by a command of its own, never among the specs.

| Why | Tags |
|---|---|
| a real model is slow, paid for and answers differently on each run, while a spec must give the same answer every run. | [testing] |
