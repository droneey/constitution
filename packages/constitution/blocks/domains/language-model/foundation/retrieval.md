# Retrieval and memory

> Governs the documents found for a model — how they are indexed, searched and cited — and what an agent keeps in its memory.

## Index

### index-records-the-model-that-embedded-it · MUST

An index of embeddings records the model and settings that built its vectors, and a query embedded by any other fails instead of searching.

| Why |
|---|
| vectors of two models are not comparable, and a search across them returns plausible noise with no error. |

### indexed-chunk-keeps-its-source · SHOULD

Each indexed chunk comes from a source the program lists and keeps the identifier and version of its document, so an answer can cite it and a change or an erasure of the document reaches it.

| Why |
|---|
| a chunk with no source can be neither cited, corrected nor erased, and a source nobody listed is a way to poison what the model reads. |

## Answers

### answer-cites-retrieved-sources · SHOULD

An answer drawn from retrieved documents names the documents it drew on, by identifiers the program checks against what it retrieved, and shows them to the person.

| Why |
|---|
| a person can verify only an answer whose sources they can open, and a citation the model invented points nowhere. |

## Memory

### memory-keeps-its-source-and-person · SHOULD

What an agent writes to its memory from text others wrote keeps its source, is scoped to its person, and is read back as content, never as instructions.

| Why |
|---|
| memory written from a poisoned page steers every later run that reads it, unseen. |
