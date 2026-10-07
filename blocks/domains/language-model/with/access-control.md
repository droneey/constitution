# Language model with access control

> Governs what a model is given of people's documents and conversations.

## Retrieval

### retrieval-scoped-to-the-callers-rights → object-access-checked-against-the-caller · MUST
A search that finds documents for a model is limited, inside the search itself and before ranking, to those the person it acts for may read; no document is left for the model to withhold.

| Why | Tags |
|---|---|
| whatever reaches the model's context can reach its answer, and an instruction to keep a document secret is one a question can undo. | [security, data] |

## Conversations

### conversation-loaded-only-for-its-owner → object-access-checked-against-the-caller · MUST
A conversation, a memory or notes given to a model are loaded for the person and the tenant of the current request and checked against them, never by an identifier the caller supplies alone.

| Why | Tags |
|---|---|
| a conversation is its person's data, and one loaded by an identifier anyone can send gives its history to whoever guesses that identifier. | [security, data] |
