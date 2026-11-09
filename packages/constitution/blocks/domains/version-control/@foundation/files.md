# Files

> Governs which files repository history keeps, and how, a moved file's among them, and the form of a link from one file to another.

## Vocabulary

A clone's **working copy** is the files it has checked out, with the changes not yet committed.

The **ignore list** names the files version control leaves untracked.

The **working-notes folder** is **`local/`**{#working-notes}.

A **local environment file** is a file of one machine's environment variables that the project's tools load, its secrets often among them.

A binary file is large above **`10 MB`**{#large-file-size}.

## General

### text-stored-with-one-line-ending · MUST

All text is stored in the repository history with one line ending, whatever the platform of whoever commits it.

#### Why

Mixed line endings fill diffs with lines nobody changed and break scripts on the other platform.

#### Examples

```text title="Avoid"
invoices/totals   CRLF
invoices/tax      LF
```

```text title="Prefer"
stored line ending:  LF for every text file

invoices/totals   LF
invoices/tax      LF
```

## What repository history keeps

### large-files-outside-history · SHOULD

Every binary file larger than `10 MB` lives outside the repository history, which keeps only a reference to it.

#### Why

A large file in the repository history is downloaded by every clone for ever, even after it is deleted.

#### Examples

```text title="Avoid"
history
  assets/catalogue-video.mp4    240 MB
```

```text title="Prefer"
history
  assets/catalogue-video.mp4    pointer to sha256:4e1f..., 132 B

large-file store
  sha256:4e1f...                240 MB
```

### generated-files-not-committed · MUST

No generated file is committed. Exempt: a file the code imports that a check of a fresh clone needs before any step runs, and a copy kept for readers outside the code, such as a schema an editor fetches by its address.

#### Why

A committed build output drifts from its source and fills every diff, while a fresh clone's type check needs the generated files the code imports, and a reader outside the code finds a copy only where it is committed.

#### Examples

```text title="Avoid"
tracked
  src/orders/order
  build/orders/order.bundle
  build/orders/order.map
```

```text title="Prefer"
tracked
  src/orders/order

ignored
  build/
```

### ignored-file-never-tracked · MUST

No file the ignore list covers is tracked.

#### Why

Version control goes on tracking a file it already tracks whatever the ignore list says, so an ignore rule alone leaves in the repository history what is already there.

#### Examples

```text title="Avoid"
ignore list:  .env.local

tracked
  .env.local
  src/orders/order.ts
```

```text title="Prefer"
ignore list:  .env.local

$ untrack .env.local, keeping the file

tracked
  src/orders/order.ts
```

### machine-local-files-ignored · MUST

Every file local to one machine is on the ignore list. Such files include the local environment file and a person's overrides of the project's tools.

#### Why

A file of one machine that is committed replaces every other machine's setup with its own at their next pull.

#### Examples

```text title="Avoid"
ignore list
  build/

tracked
  .env.local
  .editor/settings.local
```

```text title="Prefer"
ignore list
  build/
  .env.local
  .editor/settings.local
```

### environment-example-holds-only-placeholders · MUST

Every committed example of the local environment file holds only placeholders, never a real value.

#### Why

A real value in the example becomes every machine's value, and a real secret there has leaked.

#### Examples

```text title="Avoid"
# .env.example
ORDERS_DATABASE_URL=store://orders:s3cr3t@db.shop.example/orders
PAYMENTS_API_KEY=<the live key>
```

```text title="Prefer"
# .env.example
ORDERS_DATABASE_URL=replace-with-the-orders-database-url
PAYMENTS_API_KEY=replace-with-a-payments-test-key
```

### working-notes-stay-out-of-history · MUST

Every working note, such as a plan, lives in the working-notes folder, never in the repository history. Exempt: a record of a decision, which `DECISIONS.md` holds.

#### Why

Working notes are true for a day, and committed they mislead every later reader.

#### Examples

```text title="Avoid"
tracked
  docs/plan-refunds.md
  src/refunds/refund.ts
```

```text title="Prefer"
tracked
  DECISIONS.md
  src/refunds/refund.ts

ignored
  local/plan-refunds.md
```

## Moves

### change-moves-a-file-never-rewrites-it · SHOULD

Every change that moves a file moves it, never deletes it and writes it anew.

#### Why

A file deleted and written anew can lose or alter its content unseen, and the repository history no longer follows it across the move, so its past stops at the change that moved it.

#### Examples

```text title="Avoid"
deleted  billing/invoice
added    invoices/invoice   (written again from memory)
```

```text title="Prefer"
renamed  billing/invoice -> invoices/invoice
```

## Links

### repository-link-is-a-path · SHOULD

Every link between two files of the repository is a path, never an address on the service that hosts it. The path is relative to the linking file or to the repository's root. Exempt: a link in a file that a registry or another service shows apart from the repository, such as a package's readme, which is an address.

#### Why

A path works on every branch, fork, clone and mirror, while an address points at one branch on the service that hosts the repository, and goes stale when the branch or the service moves.

#### Examples

```text title="Avoid"
# docs/orders.md
See the [refund flow](https://forge.example/shop/blob/main/docs/refunds.md).
```

```text title="Prefer"
# docs/orders.md
See the [refund flow](./refunds.md).
```
