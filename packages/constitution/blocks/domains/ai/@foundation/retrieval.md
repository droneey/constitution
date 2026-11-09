# Retrieval

> Governs the documents found for a language model: how they are indexed, searched and cited.

## Index

### index-records-the-model-that-embedded-it · MUST

Every index of embeddings records the language model and the settings that built its vectors.

#### Why

Vectors of two language models are not comparable, so an index that does not say which built it cannot be searched safely.

#### Examples

```pseudo title="Avoid"
let articleIndex = createIndex({
  name: "help-articles",
})
```

```pseudo title="Prefer"
let articleIndex = createIndex({
  name: "help-articles",
  embedding: {
    model: "embed-2025-03-01",
    dimensions: 1024,
    normalized: true,
  },
})
```

### query-embedded-by-another-model-fails · MUST

Every query embedded by another language model or other settings than its index records fails, never searching.

#### Why

Vectors of two language models are not comparable, and a search across them returns plausible noise with no error.

#### Examples

```pseudo title="Avoid"
function searchArticles(question, index)
  let query = embedder.embed(question)

  return index.nearest(query.vector, maxArticleHits)
```

```pseudo title="Prefer"
function searchArticles(question, index)
  let query = embedder.embed(question)

  if query.embedding is not index.embedding then
    throw new EmbeddingMismatchError(query.embedding, index.embedding)

  return index.nearest(query.vector, maxArticleHits)
```

### indexed-chunk-keeps-its-source · SHOULD

Every indexed chunk keeps the identifier and the version of the document it came from.

#### Why

A chunk with no source can be neither cited, corrected nor erased, so a change or an erasure of its document never reaches it.

#### Examples

```pseudo title="Avoid"
function indexArticle(article, index)
  for chunk in splitIntoChunks(article.body)
    call index.add({
      text: chunk,
      vector: embedder.embed(chunk).vector,
    })
```

```pseudo title="Prefer"
function indexArticle(article, index)
  for chunk in splitIntoChunks(article.body)
    call index.add({
      text: chunk,
      vector: embedder.embed(chunk).vector,
      sourceId: article.id,
      sourceVersion: article.version,
    })
```

### indexed-source-listed-by-the-program · MUST

Every indexed chunk comes from a source the program lists.

#### Why

A source nobody listed is a way to poison what the language model reads.

#### Examples

```pseudo title="Avoid"
function crawl(url, index)
  let page = fetchPage(url)

  call indexPage(page, index)
  for link in page.links
    call crawl(link, index)
```

```pseudo title="Prefer"
let indexedSources = [
  "https://help.example.com/articles/",
  "https://help.example.com/policies/",
]

function crawl(url, index)
  if not indexedSources.any(source => url.startsWith(source)) then
    return

  let page = fetchPage(url)

  call indexPage(page, index)
  for link in page.links
    call crawl(link, index)
```

## Answers

### answer-cites-retrieved-sources · SHOULD

Every answer drawn from retrieved documents shows its person the documents it drew on.

#### Why

An answer without its sources cannot be checked by the person who acts on it.

#### Examples

```pseudo title="Avoid"
function answerQuestion(question, context)
  let documents = articles.search(question, context)
  let answer = assistant.answer(question, documents, context)

  return { text: answer.text }
```

```pseudo title="Prefer"
function answerQuestion(question, context)
  let documents = articles.search(question, context)
  let answer = assistant.answer(question, documents, context)
  let cited = documents.filter(document => answer.citedIds.contains(document.id))

  return {
    text: answer.text,
    sources: cited.map(document => { title: document.title, url: document.url }),
  }
```

### citation-checked-against-what-was-retrieved · MUST

Every citation an answer shows is checked by the program against the documents it retrieved for that answer.

#### Why

A citation the language model invented sends the person nowhere, or to a document that never said what the answer claims.

#### Examples

```pseudo title="Avoid"
function answerQuestion(question, context)
  let documents = articles.search(question, context)
  let answer = assistant.answer(question, documents, context)

  return { text: answer.text, sources: answer.citations }
```

```pseudo title="Prefer"
function answerQuestion(question, context)
  let documents = articles.search(question, context)
  let answer = assistant.answer(question, documents, context)
  let retrievedIds = documents.map(document => document.id)
  let invented = answer.citations.filter(id => not retrievedIds.contains(id))

  if invented is not empty then
    throw new InventedCitationError(invented)

  return { text: answer.text, sources: answer.citations }
```
