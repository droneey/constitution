# Tests

> Governs the specs of the code around a model call.

## Models

### spec-replaces-the-model → test-runs-in-a-sandbox · MUST
A spec replaces the model with scripted or recorded answers, and an eval that calls a real model runs apart, by a command of its own, never among the specs.

| Why | Tags |
|---|---|
| a real model is slow, paid for and answers differently on each run, while a spec must give the same answer every run. | [testing] |

## Endings

### model-call-endings-have-cases → declared-failure-has-a-case · SHOULD
The code around a model call has a case for each way the call can end other than with a finished output — a cut at the token limit, a refusal, an output that fails its schema, a timeout, a run stopped at its bound.

| Why | Tags |
|---|---|
| these endings are rare in a demo and common in use, and only a case shows what the person sees when one happens. | [testing, errors] |
