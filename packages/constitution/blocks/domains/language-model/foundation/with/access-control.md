# Access control

> Governs what a language model is given of people's documents and conversations.

## General

### retrieval-scoped-to-the-callers-rights → object-access-checked-against-the-caller · MUST

A search that finds documents for a language model finds only those its person may read. The limit is applied inside the search itself and before ranking; no document is left for the model to withhold.

| Why |
|---|
| whatever reaches the language model's context can reach its answer, and an instruction to keep a document secret is one a question can undo. |

### answer-cache-keyed-by-the-callers-rights → caller-shaped-result-never-served-from-a-cache-to-another · MUST

A cache of language-model answers is keyed by the caller's rights. Its key holds what shaped the answer — the prompt, the model and the caller's rights or tenant — and it never serves one caller's answer to another with other rights.

| Why |
|---|
| an answer drawn from one caller's data and served from a cache to another hands over what the second could never read. |
