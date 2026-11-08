# Accounts

> Governs what a language model is given of people's documents.

## General

### retrieval-scoped-to-the-callers-rights → object-access-checked-against-the-caller · MUST

Every search that finds documents for a language model applies its caller's rights inside the search, before ranking. No document its caller may not read is ranked.

| Why |
|---|
| a document dropped only after ranking leaves the caller fewer answers than the documents they may read hold, and one left for the language model to withhold is one a question can undo. |
