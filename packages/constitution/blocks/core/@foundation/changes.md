# Changes

> Governs a change, one step of a task's work: its scope and what it carries.

## Vocabulary

A **tidying** changes the structure of code and not its behaviour; a refactoring is one.

The specs, cases and boundaries a change touches are those the tests chapter defines.

A change's **description** is the text that says what the change does and why, kept with the change.

## Scope

### change-limited-to-its-task · SHOULD

Every change does what its task asks and nothing else. It holds no unrelated tidying, reformat or rename, and fixes no problem found outside the task on the way.

#### Why

A change that also does something else hides its task among lines nobody asked for, so a reviewer misses what it changed and undoing it takes the rest with it.

#### Examples

```text title="Avoid"
task: refund a paid order

M orders/refund
M orders/__tests__/refund.test
M users/profile  # a rename outside the task
```

```text title="Prefer"
task: refund a paid order

M orders/refund
M orders/__tests__/refund.test

reported: users/profile names
  its fields unclearly
```

### problem-outside-the-task-reported · SHOULD

Every problem a change finds outside its task is reported.

#### Why

A problem seen and left unsaid is found again by the next reader, or not at all, while it does its harm.

#### Examples

```text title="Avoid"
Done: refunds for paid orders.
The check passes.
```

```text title="Prefer"
Done: refunds for paid orders.
The check passes.

Found outside the task, left as it is:
invoices/send-invoice sends a second
email when the mail server times out.
```

### tidying-shipped-before-the-behaviour · SHOULD

Every tidying ships before the change of behaviour that needs it, as its own change. Exempt: a tidying that stays within the files the change of behaviour touches.

#### Why

A change that mixes a tidying with a change of behaviour hides the behaviour among moved lines, so a reviewer cannot tell which line changed what the program does.

#### Examples

```text title="Avoid"
feat: Refund paid orders

 34 files changed
 # Payment renamed to Charge everywhere
```

```text title="Prefer"
refactor: Rename Payment to Charge

 31 files changed

feat: Refund paid orders

 3 files changed
```

### tidying-keeps-the-specs-of-its-boundaries · SHOULD

Every tidying leaves the specs of its boundaries unchanged. It changes no case's setup or expectation in a spec of a boundary; an expectation that has to change marks a change of behaviour, which ships as one. Exempt: a spec that follows a boundary the tidying renames or moves.

#### Why

A tidying that also edits its specs can change the behaviour unseen, since the specs that would have caught it changed with it.

#### Examples

```text title="Avoid"
refactor: Extract tax calculation

  orders/__tests__/total.test
- expect(total).is(110)
+ expect(total).is(100)
```

```text title="Prefer"
refactor: Move tax to its module

  tax/__tests__/total.test
- import "orders/total"
+ import "tax/total"
  expect(total).is(110)
```

## What it carries

### change-description-states-its-reason · SHOULD

Every change's reason is written in its description, never only in a conversation.

#### Why

The next person who reads the change needs its reason, and a conversation is not where they will look.

#### Examples

```text title="Avoid"
fix: Round the tax of each invoice line

(the reason was given in the review thread)
```

```text title="Prefer"
fix: Round the tax of each invoice line

The tax office sums the tax rounded per line,
so a total rounded once differed from its
assessment by a cent on invoices of many lines.
```

### change-corrects-the-documents-it-falsifies · SHOULD

Every change that makes a document false corrects it in the same change. Such documents include a readme, `PROJECT.md`, an example of the environment variables, a comment and a guide.

#### Why

A document corrected later is not corrected, and a reader trusts the stale one until it costs them.

#### Examples

```text title="Avoid"
- DATABASE_URL
+ ORDERS_DATABASE_URL

M orders/config
```

```text title="Prefer"
- DATABASE_URL
+ ORDERS_DATABASE_URL

M orders/config
M .env.example
M README.md
```

### new-term-enters-the-glossary-with-its-change · SHOULD

Every term of the business a change introduces enters the glossary of `PROJECT.md` in that same change.

#### Why

A term missing from the glossary falsifies no document, so no other rule brings it in, and the next name for the same thing is chosen anew and differs.

#### Examples

```text title="Avoid"
feat: Hold an order line back until its stock arrives

M orders/domain/backorder.entity
M orders/application/place-order.use-case
```

```text title="Prefer"
feat: Hold an order line back until its stock arrives

M orders/domain/backorder.entity
M orders/application/place-order.use-case
M PROJECT.md
  + Backorder: an order line accepted while its
    product is out of stock, shipped once it arrives.
```

### choice-between-alternatives-recorded · SHOULD

Every strategic choice between real alternatives is recorded with what it rejected. A strategic choice is one a later reader could propose again and that shapes much of the program beyond one rule or one module, such as its store, its framework, its protocol, its architecture or a policy many later changes follow. The change that makes it records the choice as it now stands in `DECISIONS.md`, in a few lines: what was chosen, what was rejected and why, and its date. Exempt: a choice the code, a rule's Why or the change's description already explains, such as a rule's wording, level or place, a rule split, merged or renamed, a fix or a version bump.

#### Why

A strategic choice recorded without its rejected alternatives is argued again by everyone who meets them, and a log that also keeps every rule's change and every fix buries those few under what the history already holds — an architecture decision record.

#### Examples

```md title="DECISIONS.md"
## A relational store keeps the orders · 2026-10-02

Chosen: a relational store, for transactions across an order and its payments.

Rejected:
- A document store: an order and its payments would need a two-phase write.
- An embedded file store: the orders service runs on three hosts that share one store.
```

### change-to-a-trust-boundary-names-its-threats · SHOULD

Every change at a trust boundary names its threats and how each is met, in its description. So does a change that adds a way into the program, such as an endpoint, a subcommand, an upload or a consumer of messages. A trust boundary is a place where data or a call passes between parties the program trusts differently, such as where outside input, as the security chapter defines it, enters, where the program acts with rights its caller lacks, or where it hands data to another system.

#### Why

A threat left unnamed while the design is still open is found in production, where it costs a breach instead of a sentence — threat modelling.

#### Examples

```md title="Description"
## Threats

POST /invoices/upload accepts a PDF from a signed-in customer.

- An oversized file: refused past 10 MB before it is read.
- A path in the file name: the file is stored under a generated id.
- Another customer's invoice: the owner is checked on every read.
- A PDF with scripts: it is served for download only, never inline.
```
