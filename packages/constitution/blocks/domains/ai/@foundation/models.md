# Models

> Governs the language model a program calls for each model task: its model snapshot, where it is fixed and its retirement.

## Vocabulary

A **model task** is one job a language model does for the program, named in the program's own words, such as summarising a ticket or classifying a message.

A language model's **model snapshot** is the identifier of one fixed version of it, never an alias its provider moves: a dated identifier, or a dateless one its provider declares pinned.

## Pins

### model-pinned-to-a-snapshot · MUST

Every language model the program calls, a fallback included, is named by its model snapshot, never by an alias.

#### Why

A provider moves an alias at short notice, so the program's answers change with no change of its own.

#### Examples

```pseudo title="Avoid"
let ticketSummaryModels = {
  primary: "writer-latest",
  fallback: "writer-mini",
}
```

```pseudo title="Prefer"
let ticketSummaryModels = {
  primary: "writer-2025-06-01",
  fallback: "writer-mini-2025-04-15",
}
```

### preview-model-never-in-production · MUST

No preview or experimental language model is called in production.

#### Why

A provider changes and retires a preview at short notice, so the answers of a program in production change or fail with no change of its own.

#### Examples

```pseudo title="Avoid"
let ticketSummaryModel = "writer-3-preview-2025-09-10"
```

```pseudo title="Prefer"
let ticketSummaryModel = "writer-2025-06-01"
```

### model-fixed-in-its-artefact-or-prompt-version · MUST

Every language model the program may call, and each setting shaping its output, is fixed in the artefact or its prompt version. It is never read from environment variables or another store. Exempt: a choice among the language models and the settings so fixed that a person or a team makes, which a store may hold.

#### Why

A language model or a setting read from environment variables or a store other than an unchanging prompt version changes outside every check, so the program answers differently with no change anyone reviewed.

#### Examples

```pseudo title="Avoid"
let ticketSummaryCall = {
  model: env("SUMMARY_MODEL"),
  temperature: number(env("SUMMARY_TEMPERATURE")),
  maxOutputTokens: 300,
}
```

```pseudo title="Prefer"
let ticketSummaryCall = {
  model: "writer-2025-06-01",
  temperature: 0.2,
  maxOutputTokens: 300,
}
```

## Retirement

### pinned-model-retirement-tracked · SHOULD

Every pinned model snapshot has the retirement date its provider announced recorded beside its pin.

#### Why

A provider retires a model snapshot on a date it announces, and after it every call to the pin fails, so a pin nobody watches turns stability into an outage.

#### Examples

```pseudo title="Avoid"
let ticketSummaryModel = {
  snapshot: "writer-2025-06-01",
}
```

```pseudo title="Prefer"
let ticketSummaryModel = {
  snapshot: "writer-2025-06-01",
  retiresOn: 2026-12-01,
}
```

### pinned-model-replaced-before-its-retirement · MUST

Every pinned model snapshot is replaced before the retirement date its provider announced.

#### Why

Every call to a retired model snapshot fails, so a replacement that ships after the date ships into an outage.

#### Examples

```text title="Avoid"
writer-2025-06-01   retires 2026-12-01

2026-12-01   every ticket summary fails
2026-12-03   pin moved to writer-2026-09-15
```

```text title="Prefer"
writer-2025-06-01   retires 2026-12-01

2026-10-20   evals pass on writer-2026-09-15
2026-11-02   pin moved to writer-2026-09-15
2026-12-01   old snapshot retired, nothing calls it
```
