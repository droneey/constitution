# Memory

> Governs what a model run keeps for later model runs: its source and whom it is read for.

## Vocabulary

A model run's **model memory** is what it writes for later model runs to read back.

## General

### memory-keeps-its-source · SHOULD

Every model memory written from outside input keeps the source it came from.

#### Why

Model memory written from a poisoned page steers every later model run that reads it, and one with no source can be neither traced to the page nor removed with it.

#### Examples

```pseudo title="Avoid"
call memory.write(run.person.id, {
  note: extracted.fact,
})
```

```pseudo title="Prefer"
call memory.write(run.person.id, {
  note: extracted.fact,
  source: { url: page.url, fetchedAt: page.fetchedAt },
})
```

### memory-scoped-to-its-person · MUST

Every model memory written from outside input is read back only by model runs for the person it was written for.

#### Why

Model memory one person's run wrote from a poisoned page steers every other person's runs that read it, unseen, and hands them what the first person's text held.

#### Examples

```pseudo title="Avoid"
function recall(run, query)
  return memory.search(query)
```

```pseudo title="Prefer"
function recall(run, query)
  return memory.search(query, { personId: run.person.id })
```
