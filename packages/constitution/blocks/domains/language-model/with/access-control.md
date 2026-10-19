# Access control

> Governs what a model is given of people's documents and conversations.

## Retrieval

### retrieval-scoped-to-the-callers-rights → object-access-checked-against-the-caller · MUST

A search that finds documents for a model is limited, inside the search itself and before ranking, to those the person it acts for may read; no document is left for the model to withhold.

| Why | Tags |
|---|---|
| whatever reaches the model's context can reach its answer, and an instruction to keep a document secret is one a question can undo. | [security, data] |

## Caches

### answer-cache-keyed-by-the-callers-rights → object-access-checked-against-the-caller · MUST

A cache of model answers is keyed by what shaped the answer — the prompt, the model and the caller's rights or tenant — and never serves one caller's answer to another with other rights.

| Why | Tags |
|---|---|
| an answer drawn from one caller's data and served from a cache to another hands over what the second could never read. | [security, data] |
