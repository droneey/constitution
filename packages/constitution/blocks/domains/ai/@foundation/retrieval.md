# Retrieval

> Governs the documents found for a language model: how they are indexed, searched and cited.

## Index

### index-records-the-model-that-embedded-it · MUST

Every index of embeddings records the language model and the settings that built its vectors.

| Why |
|---|
| vectors of two language models are not comparable, so an index that does not say which built it cannot be searched safely. |

### query-embedded-by-another-model-fails · MUST

Every query embedded by another language model or other settings than its index records fails, never searching.

| Why |
|---|
| vectors of two language models are not comparable, and a search across them returns plausible noise with no error. |

### indexed-chunk-keeps-its-source · SHOULD

Every indexed chunk keeps the identifier and the version of the document it came from.

| Why |
|---|
| a chunk with no source can be neither cited, corrected nor erased, so a change or an erasure of its document never reaches it. |

### indexed-source-listed-by-the-program · MUST

Every indexed chunk comes from a source the program lists.

| Why |
|---|
| a source nobody listed is a way to poison what the language model reads. |

## Answers

### answer-cites-retrieved-sources · SHOULD

Every answer drawn from retrieved documents shows its person the documents it drew on.

| Why |
|---|
| an answer without its sources cannot be checked by the person who acts on it. |

### citation-checked-against-what-was-retrieved · MUST

Every citation an answer shows is checked by the program against the documents it retrieved for that answer.

| Why |
|---|
| a citation the language model invented sends the person nowhere, or to a document that never said what the answer claims. |
