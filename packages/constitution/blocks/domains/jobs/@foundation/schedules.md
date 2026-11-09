# Schedules

> Governs work run on a schedule: once per tick, keyed by its tick, in a stated zone.

## Vocabulary

A scheduled job's **tick** is one instant its schedule names for a run.

## Ticks

### scheduled-job-runs-once-per-tick · MUST

Every scheduled job runs once per tick, however many instances of the program run. Its scheduler claims each tick once, in a store the instances share, or runs as one copy, never by a timer or a lock local to each instance.

#### Why

Every instance's timer fires on the same tick, so a second replica doubles every run, and a lock in a file or a memory guards only its own host.

#### Examples

```pseudo title="Avoid"
# invoices/presentation/jobs/send-overdue-reminders
schedule("send-overdue-reminders", {
  every: hourly,
  claimedIn: localLock,  # one lock in each instance
  missed: skip,
  overlapping: skip
}, run)
```

```pseudo title="Prefer"
# invoices/presentation/jobs/send-overdue-reminders
schedule("send-overdue-reminders", {
  every: hourly,
  claimedIn: sharedTickStore,
  missed: skip,
  overlapping: skip
}, run)
```

### scheduled-run-keyed-by-its-tick → operation-idempotent-by-design · MUST

Every run of a scheduled job is keyed by its tick and idempotent: a tick run twice, after a scheduler's retry or a claim whose lease expired, changes nothing the first run did not.

#### Why

Schedulers promise about one run per tick, sometimes two and sometimes none, so a run not keyed by its tick repeats its effect each time a tick runs twice.

#### Examples

```pseudo title="Avoid"
# billing/application/use-cases/commands/bill-subscriptions.use-case
function createBillSubscriptions({ subscriptionRepository, invoiceRepository, ids })
  return function(input, context)
    for subscription in await subscriptionRepository.dueAt(input.tick, context)
      let issued = issue(ids.next(), subscription)  # a tick run twice bills twice

      await invoiceRepository.save(issued.invoice, [issued.event], context)
```

```pseudo title="Prefer"
# billing/application/use-cases/commands/bill-subscriptions.use-case
function createBillSubscriptions({ subscriptionRepository, invoiceRepository })
  return function(input, context)
    for subscription in await subscriptionRepository.dueAt(input.tick, context)
      let invoiceId = invoiceIdFor(subscription.id, input.tick)

      if await invoiceRepository.find(invoiceId, context) is <absent> then
        let issued = issue(invoiceId, subscription)

        await invoiceRepository.save(issued.invoice, [issued.event], context)
```

### scheduled-job-declares-its-missed-ticks · SHOULD

Every scheduled job declares what happens to a tick missed while nothing ran: it is run once late, within a deadline, or skipped.

#### Why

The scheduler's default decides otherwise, and a backlog of missed ticks run at once after an outage overloads what they touch.

#### Examples

```pseudo title="Avoid"
# invoices/presentation/jobs/send-overdue-reminders
schedule("send-overdue-reminders", {
  every: hourly,
  overlapping: skip
}, run)
```

```pseudo title="Prefer"
# invoices/presentation/jobs/send-overdue-reminders
schedule("send-overdue-reminders", {
  every: hourly,
  missed: runOnceLate({ within: hours(6) }),
  overlapping: skip
}, run)
```

### scheduled-job-declares-its-overlapping-ticks · SHOULD

Every scheduled job declares what happens to a tick that comes while its last run still works: it is skipped, waits or replaces that run.

#### Why

The scheduler's default decides otherwise, and runs piled on a slow one overload what they touch.

#### Examples

```pseudo title="Avoid"
# invoices/presentation/jobs/send-overdue-reminders
schedule("send-overdue-reminders", {
  every: hourly,
  missed: runOnceLate({ within: hours(6) })
}, run)
```

```pseudo title="Prefer"
# invoices/presentation/jobs/send-overdue-reminders
schedule("send-overdue-reminders", {
  every: hourly,
  missed: runOnceLate({ within: hours(6) }),
  overlapping: skip
}, run)
```

## Time

### local-schedule-states-its-clock-changes · MUST

Every schedule set in a local time states what it does in the hour a change of clock skips or repeats.

#### Why

A daily job set in local time runs twice or not at all on the night the clocks change, unless its schedule says which.

#### Examples

```pseudo title="Avoid"
# reports/presentation/jobs/send-daily-digest
schedule("send-daily-digest", {
  at: "02:30",
  zone: "Europe/Kyiv"
}, run)
```

```pseudo title="Prefer"
# reports/presentation/jobs/send-daily-digest
schedule("send-daily-digest", {
  at: "02:30",
  zone: "Europe/Kyiv",
  whenSkipped: runAtTheFirstInstantAfter,
  whenRepeated: runOnTheFirstOnly
}, run)
```
