# Schedules

> Governs work run on a schedule: once per tick, keyed by its tick, in a stated zone.

## Vocabulary

A scheduled job's **tick** is one instant its schedule names for a run.

## Ticks

### scheduled-job-runs-once-per-tick · MUST

Every scheduled job runs once per tick, however many instances of the program run. Its tick is claimed once, in a store the instances share or by a scheduler that runs one copy, never by a timer or a lock local to each instance.

| Why |
|---|
| every instance's timer fires on the same tick, so a second replica doubles every run, and a lock in a file or a memory guards only its own host. |

### scheduled-run-keyed-by-its-tick → operation-idempotent-by-design · MUST

Every run of a scheduled job is keyed by its tick and idempotent: a tick run twice, after a scheduler's retry or a claim whose lease expired, changes nothing the first run did not.

| Why |
|---|
| schedulers promise about one run per tick, sometimes two and sometimes none, so a run not keyed by its tick repeats its effect each time a tick runs twice. |

### scheduled-job-declares-its-missed-ticks · SHOULD

Every scheduled job declares what happens to a tick missed while nothing ran: it is run once late, within a deadline, or skipped.

| Why |
|---|
| the scheduler's default decides otherwise, and a backlog of missed ticks run at once after an outage overloads what they touch. |

### scheduled-job-declares-its-overlapping-ticks · SHOULD

Every scheduled job declares what happens to a tick that comes while its last run still works: it is skipped, waits or replaces that run.

| Why |
|---|
| the scheduler's default decides otherwise, and runs piled on a slow one overload what they touch. |

## Time

### local-schedule-states-its-clock-changes · MUST

Every schedule set in a local time states what it does in the hour a change of clock skips or repeats.

| Why |
|---|
| a daily job set in local time runs twice or not at all on the night the clocks change, unless its schedule says which. |
